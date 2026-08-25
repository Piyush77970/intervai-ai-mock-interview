const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/payments/plans
 * List available pricing plans
 */
router.get('/plans', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM plans WHERE is_active = 1');
    const parsed = list.map(p => {
      try {
        p.features = JSON.parse(p.features);
        p.limits = JSON.parse(p.limits);
      } catch (e) {}
      return p;
    });
    res.json(parsed);
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Server error loading pricing models' });
  }
});

/**
 * @route GET /api/payments/subscription
 * Get current user subscription details
 */
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const sub = await db.get(
      `SELECT s.*, p.name as plan_name, p.price_monthly, p.price_yearly, p.features, p.limits
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    if (sub) {
      try {
        sub.features = JSON.parse(sub.features);
        sub.limits = JSON.parse(sub.limits);
      } catch (e) {}
    }
    res.json(sub || { plan_name: 'Free' });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.status(500).json({ error: 'Server error fetching membership info' });
  }
});

/**
 * @route POST /api/payments/checkout
 * Mock transaction checkout flow
 */
router.post('/checkout', authenticate, async (req, res) => {
  const { plan_id, billing_cycle, coupon_code, payment_method } = req.body;

  if (!plan_id || !billing_cycle || !payment_method) {
    return res.status(400).json({ error: 'Missing check parameters' });
  }

  try {
    const plan = await db.get('SELECT * FROM plans WHERE id = ?', [plan_id]);
    if (!plan) return res.status(404).json({ error: 'Selected plan not found' });

    let cost = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // Apply Coupon Code
    let couponApplied = null;
    if (coupon_code) {
      const coupon = await db.get(
        'SELECT * FROM coupons WHERE code = ? AND (expiration_date IS NULL OR expiration_date > CURRENT_TIMESTAMP) AND (max_uses IS NULL OR used_count < max_uses)',
        [coupon_code.toUpperCase().trim()]
      );

      if (coupon) {
        if (coupon.discount_type === 'percent') {
          cost = cost * (1 - (coupon.discount_value / 100));
        } else if (coupon.discount_type === 'fixed') {
          cost = Math.max(0, cost - coupon.discount_value);
        }
        couponApplied = coupon;
      } else {
        return res.status(400).json({ error: 'Invalid, expired, or fully-redeemed discount code' });
      }
    }

    // Set billing dates
    const currentPeriodStart = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const currentPeriodEnd = new Date();
    if (billing_cycle === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }
    const formattedEnd = currentPeriodEnd.toISOString().slice(0, 19).replace('T', ' ');

    // Start database updates: Use replace to maintain one active subscription per candidate
    await db.run(
      `INSERT OR REPLACE INTO subscriptions (user_id, plan_id, status, billing_cycle, current_period_start, current_period_end) 
       VALUES (?, ?, 'active', ?, ?, ?)`,
      [req.user.id, plan_id, billing_cycle, currentPeriodStart, formattedEnd]
    );

    const subscription = await db.get('SELECT * FROM subscriptions WHERE user_id = ?', [req.user.id]);
    const subId = subscription.id;

    // Record Payment
    const txId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    const payResult = await db.run(
      `INSERT INTO payments (user_id, subscription_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, 'success')`,
      [req.user.id, subId, cost, payment_method, txId]
    );
    const paymentId = payResult.lastID;

    // Generate Invoice
    const invoiceNum = `INV-2026-${String(paymentId).padStart(4, '0')}`;
    const tax = parseFloat((cost * 0.18).toFixed(2)); // 18% GST standard
    await db.run(
      `INSERT INTO invoices (payment_id, invoice_number, pdf_url, tax_amount, total_amount) 
       VALUES (?, ?, ?, ?, ?)`,
      [paymentId, invoiceNum, `/invoices/${invoiceNum.toLowerCase()}.pdf`, tax, cost]
    );

    // Update coupon usages
    if (couponApplied) {
      await db.run('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponApplied.id]);
      await db.run('INSERT INTO coupon_redemptions (coupon_id, user_id) VALUES (?, ?)', [couponApplied.id, req.user.id]);
    }

    // Notify User
    await db.run(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, 'Subscription Activated!', ?, 'payment')`,
      [req.user.id, `Thank you for upgrading to the IntervAI ${plan.name} Plan (${billing_cycle}). Payment of ₹${cost} successful.`]
    );

    res.json({
      message: 'Subscription successfully upgraded!',
      subscription_id: subId,
      amount_paid: cost,
      transaction_id: txId,
      invoice_number: invoiceNum
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Server error completing payment checkout' });
  }
});

/**
 * @route POST /api/payments/subscription/cancel
 * Cancel renewal of subscription
 */
router.post('/subscription/cancel', authenticate, async (req, res) => {
  try {
    const sub = await db.get('SELECT * FROM subscriptions WHERE user_id = ? AND status = "active"', [req.user.id]);
    if (!sub) {
      return res.status(404).json({ error: 'No active paid subscription found to cancel' });
    }

    await db.run('UPDATE subscriptions SET status = "cancelled" WHERE id = ?', [sub.id]);

    await db.run(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, 'Subscription Cancelled', 'Your subscription was successfully cancelled. Access will remain valid until the end of your billing cycle.', 'payment')`,
      [req.user.id]
    );

    res.json({ message: 'Renewal cancelled successfully. Access remains active until period ends.' });
  } catch (err) {
    console.error('Cancellation error:', err);
    res.status(500).json({ error: 'Server error cancelling membership renewal' });
  }
});

/**
 * @route GET /api/payments/history
 * List transaction history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await db.all(
      `SELECT p.*, s.billing_cycle, pl.name as plan_name 
       FROM payments p
       JOIN subscriptions s ON p.subscription_id = s.id
       JOIN plans pl ON s.plan_id = pl.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(payments);
  } catch (err) {
    console.error('Payments history load error:', err);
    res.status(500).json({ error: 'Server error loading transaction history' });
  }
});

/**
 * @route GET /api/payments/invoices
 * Get invoices list
 */
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await db.all(
      `SELECT i.*, p.amount, p.payment_method, p.transaction_id, pl.name as plan_name
       FROM invoices i
       JOIN payments p ON i.payment_id = p.id
       JOIN subscriptions s ON p.subscription_id = s.id
       JOIN plans pl ON s.plan_id = pl.id
       WHERE p.user_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(invoices);
  } catch (err) {
    console.error('Invoices load error:', err);
    res.status(500).json({ error: 'Server error loading billing invoices' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error while fetching agents' });
  }
});

// @route   GET /api/agents/:id
// @desc    Get single agent
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Get agent error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(500).json({ message: 'Server error while fetching agent' });
  }
});

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^\+\d{1,4}\d{10,}$/).withMessage('Valid mobile number with country code is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, mobile, password } = req.body;

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ 
      $or: [{ email }, { mobile }] 
    });
    
    if (existingAgent) {
      return res.status(400).json({ 
        message: 'Agent with this email or mobile number already exists' 
      });
    }

    // Create agent
    const agent = new Agent({
      name,
      email,
      mobile,
      password
    });

    await agent.save();

    // Return agent without password
    const agentData = await Agent.findById(agent._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agentData
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error while creating agent' });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').optional().matches(/^\+\d{1,4}\d{10,}$/).withMessage('Valid mobile number with country code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, mobile } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (mobile !== undefined) updateFields.mobile = mobile;

    // Check if email or mobile already exists for other agents
    if (email || mobile) {
      const existingAgent = await Agent.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      });

      if (existingAgent) {
        return res.status(400).json({ 
          message: 'Agent with this email or mobile number already exists' 
        });
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    });

  } catch (error) {
    console.error('Update agent error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(500).json({ message: 'Server error while updating agent' });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
      data: agent
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(500).json({ message: 'Server error while deleting agent' });
  }
});

module.exports = router;

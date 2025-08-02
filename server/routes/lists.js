const express = require('express');
const fs = require('fs');
const path = require('path');
const List = require('../models/List');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const { parseFile, distributeItems } = require('../utils/fileParser');

const router = express.Router();

// @route   POST /api/lists/upload
// @desc    Upload and distribute CSV/Excel file
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Parse the uploaded file
    let parsedData;
    try {
      parsedData = await parseFile(filePath);
    } catch (parseError) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: 'Error parsing file: ' + parseError.message 
      });
    }

    if (parsedData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: 'No valid data found in file. Please ensure your file has columns: FirstName, Phone, Notes' 
      });
    }

    // Get active agents
    const agents = await Agent.find({ isActive: true }).select('_id name email');
    
    if (agents.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: 'No active agents available for distribution' 
      });
    }

    // Distribute items among agents
    const distributedLists = distributeItems(parsedData, agents);

    // Create list document
    const list = new List({
      fileName,
      totalItems: parsedData.length,
      uploadedBy: req.user._id,
      distributedLists
    });

    await list.save();

    // Populate agent details
    await list.populate('distributedLists.agent', 'name email');
    await list.populate('uploadedBy', 'email');

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      message: 'File uploaded and distributed successfully',
      data: {
        listId: list._id,
        fileName: list.fileName,
        totalItems: list.totalItems,
        distributedLists: list.distributedLists.map(dist => ({
          agent: {
            id: dist.agent._id,
            name: dist.agent.name,
            email: dist.agent.email
          },
          itemCount: dist.itemCount,
          items: dist.items
        }))
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   GET /api/lists
// @desc    Get all uploaded lists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate('uploadedBy', 'email')
      .populate('distributedLists.agent', 'name email')
      .sort({ createdAt: -1 });

    const formattedLists = lists.map(list => ({
      id: list._id,
      fileName: list.fileName,
      totalItems: list.totalItems,
      uploadedBy: list.uploadedBy.email,
      uploadedAt: list.createdAt,
      distributedLists: list.distributedLists.map(dist => ({
        agent: {
          id: dist.agent._id,
          name: dist.agent.name,
          email: dist.agent.email
        },
        itemCount: dist.itemCount
      }))
    }));

    res.json({
      success: true,
      count: formattedLists.length,
      data: formattedLists
    });

  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Server error while fetching lists' });
  }
});

// @route   GET /api/lists/:id
// @desc    Get specific list with detailed distribution
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('uploadedBy', 'email')
      .populate('distributedLists.agent', 'name email mobile');

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const formattedList = {
      id: list._id,
      fileName: list.fileName,
      totalItems: list.totalItems,
      uploadedBy: list.uploadedBy.email,
      uploadedAt: list.createdAt,
      distributedLists: list.distributedLists.map(dist => ({
        agent: {
          id: dist.agent._id,
          name: dist.agent.name,
          email: dist.agent.email,
          mobile: dist.agent.mobile
        },
        itemCount: dist.itemCount,
        items: dist.items
      }))
    };

    res.json({
      success: true,
      data: formattedList
    });

  } catch (error) {
    console.error('Get list error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(500).json({ message: 'Server error while fetching list' });
  }
});

// @route   GET /api/lists/agent/:agentId
// @desc    Get all lists assigned to specific agent
// @access  Private
router.get('/agent/:agentId', auth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const lists = await List.find({
      'distributedLists.agent': agentId
    })
    .populate('uploadedBy', 'email')
    .populate('distributedLists.agent', 'name email')
    .sort({ createdAt: -1 });

    const agentLists = lists.map(list => {
      const agentDistribution = list.distributedLists.find(
        dist => dist.agent._id.toString() === agentId
      );

      return {
        listId: list._id,
        fileName: list.fileName,
        totalItems: list.totalItems,
        uploadedBy: list.uploadedBy.email,
        uploadedAt: list.createdAt,
        assignedItems: agentDistribution ? agentDistribution.itemCount : 0,
        items: agentDistribution ? agentDistribution.items : []
      };
    });

    res.json({
      success: true,
      count: agentLists.length,
      data: agentLists
    });

  } catch (error) {
    console.error('Get agent lists error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(500).json({ message: 'Server error while fetching agent lists' });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete uploaded list
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json({
      success: true,
      message: 'List deleted successfully'
    });

  } catch (error) {
    console.error('Delete list error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(500).json({ message: 'Server error while deleting list' });
  }
});

module.exports = router;

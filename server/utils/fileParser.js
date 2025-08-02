const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize field names (case insensitive)
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().trim();
          if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
            normalizedData.firstName = data[key]?.trim() || '';
          } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
            normalizedData.phone = data[key]?.trim() || '';
          } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
            normalizedData.notes = data[key]?.trim() || '';
          }
        });
        
        // Validate required fields
        if (normalizedData.firstName && normalizedData.phone) {
          results.push(normalizedData);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const results = [];
    
    data.forEach(row => {
      // Normalize field names (case insensitive)
      const normalizedData = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
          normalizedData.firstName = row[key]?.toString().trim() || '';
        } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
          normalizedData.phone = row[key]?.toString().trim() || '';
        } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
          normalizedData.notes = row[key]?.toString().trim() || '';
        }
      });
      
      // Validate required fields
      if (normalizedData.firstName && normalizedData.phone) {
        results.push(normalizedData);
      }
    });
    
    return results;
  } catch (error) {
    throw new Error('Error parsing Excel file: ' + error.message);
  }
};

// Main parser function
const parseFile = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  
  try {
    let data;
    
    if (extension === '.csv') {
      data = await parseCSV(filePath);
    } else if (extension === '.xlsx' || extension === '.xls') {
      data = parseExcel(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
    
    return data;
  } catch (error) {
    throw new Error('Error parsing file: ' + error.message);
  }
};

// Distribute items among agents
const distributeItems = (items, agents) => {
  const totalItems = items.length;
  const totalAgents = agents.length;
  
  if (totalAgents === 0) {
    throw new Error('No agents available for distribution');
  }
  
  const itemsPerAgent = Math.floor(totalItems / totalAgents);
  const remainingItems = totalItems % totalAgents;
  
  const distributedLists = [];
  let currentIndex = 0;
  
  agents.forEach((agent, agentIndex) => {
    // Calculate items for this agent
    const agentItemCount = itemsPerAgent + (agentIndex < remainingItems ? 1 : 0);
    const agentItems = items.slice(currentIndex, currentIndex + agentItemCount);
    
    distributedLists.push({
      agent: agent._id,
      items: agentItems,
      itemCount: agentItemCount
    });
    
    currentIndex += agentItemCount;
  });
  
  return distributedLists;
};

module.exports = {
  parseFile,
  distributeItems
};

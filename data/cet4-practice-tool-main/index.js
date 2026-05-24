const express = require('express');
const path = require('path');
const { generateExam, validateAnswers } = require('./utils/questionGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// API路由
app.get('/api/exam', (req, res) => {
  try {
    const exam = generateExam();
    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate exam'
    });
  }
});

app.post('/api/exam/:examId/submit', (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;
    
    const result = validateAnswers(examId, answers);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate answers'
    });
  }
});

// 前端页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/exam', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`四级考试刷题工具服务器运行在 http://localhost:${PORT}`);
}); 
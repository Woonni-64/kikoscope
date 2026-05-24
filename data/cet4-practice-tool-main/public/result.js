// 结果页面的JavaScript
document.addEventListener('DOMContentLoaded', function() {
    displayResult();
    setupEventListeners();
});

// 显示考试结果
function displayResult() {
    const result = JSON.parse(localStorage.getItem('examResult') || '{}');
    const answers = JSON.parse(localStorage.getItem('examAnswers') || '{}');
    const examData = JSON.parse(localStorage.getItem('examData') || '{}');
    
    if (!result.examId) {
        alert('没有找到考试结果，请重新参加考试');
        window.location.href = '/';
        return;
    }
    
    // 显示总分
    const totalScore = result.score || 0;
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('scoreLabel').textContent = getScoreLabel(totalScore);
    
    // 显示考试信息
    document.getElementById('examIdResult').textContent = result.examId;
    document.getElementById('completionTime').textContent = new Date().toLocaleString();
    document.getElementById('timeUsed').textContent = '120:00'; // 可以根据实际情况计算
    
    // 显示各部分得分
    displaySectionScores(result, answers, examData);
    
    // 显示学习建议
    displayFeedback(totalScore);
}

// 获取分数等级
function getScoreLabel(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '及格';
    return '需要努力';
}

// 显示各部分得分
function displaySectionScores(result, answers, examData) {
    // 这里可以根据实际答案计算各部分得分
    // 暂时使用模拟分数
    const sectionScores = {
        wordFilling: Math.floor(Math.random() * 20) + 10,
        paragraphMatching: Math.floor(Math.random() * 20) + 10,
        readingComprehension: Math.floor(Math.random() * 30) + 15,
        translation: Math.floor(Math.random() * 15) + 5,
        writing: Math.floor(Math.random() * 15) + 5
    };
    
    document.getElementById('wfScore').textContent = sectionScores.wordFilling;
    document.getElementById('pmScore').textContent = sectionScores.paragraphMatching;
    document.getElementById('rcScore').textContent = sectionScores.readingComprehension;
    document.getElementById('trScore').textContent = sectionScores.translation;
    document.getElementById('wrScore').textContent = sectionScores.writing;
}

// 显示学习建议
function displayFeedback(score) {
    const feedbackContent = document.getElementById('feedbackContent');
    
    let feedback = '';
    
    if (score >= 90) {
        feedback = `
            <div class="feedback-item">
                <h4>🎉 优秀表现！</h4>
                <p>你的英语水平非常出色，继续保持这种学习状态。建议：</p>
                <ul>
                    <li>可以尝试更高难度的练习</li>
                    <li>多阅读英文原著和新闻</li>
                    <li>练习口语和听力技能</li>
                    <li>考虑参加更高级别的英语考试</li>
                </ul>
            </div>
        `;
    } else if (score >= 80) {
        feedback = `
            <div class="feedback-item">
                <h4>👍 良好表现！</h4>
                <p>你的英语基础扎实，有很好的提升空间。建议：</p>
                <ul>
                    <li>重点复习错题和薄弱环节</li>
                    <li>增加词汇量，特别是高频词汇</li>
                    <li>多练习阅读理解和写作</li>
                    <li>定期进行模拟考试</li>
                </ul>
            </div>
        `;
    } else if (score >= 70) {
        feedback = `
            <div class="feedback-item">
                <h4>📚 继续努力！</h4>
                <p>你的英语水平中等，需要系统性的复习。建议：</p>
                <ul>
                    <li>系统复习语法知识</li>
                    <li>扩大词汇量，每天背诵新单词</li>
                    <li>多做阅读练习，提高理解能力</li>
                    <li>练习写作，注意结构和逻辑</li>
                </ul>
            </div>
        `;
    } else if (score >= 60) {
        feedback = `
            <div class="feedback-item">
                <h4>💪 需要加强！</h4>
                <p>你的英语基础需要加强，建议制定详细的学习计划。建议：</p>
                <ul>
                    <li>从基础语法开始系统学习</li>
                    <li>每天背诵单词，建立词汇库</li>
                    <li>多听英语，提高听力理解</li>
                    <li>参加英语学习小组或课程</li>
                </ul>
            </div>
        `;
    } else {
        feedback = `
            <div class="feedback-item">
                <h4>🚀 重新开始！</h4>
                <p>不要气馁，每个人都有自己的学习节奏。建议：</p>
                <ul>
                    <li>制定详细的学习计划和时间表</li>
                    <li>从最基础的英语知识开始</li>
                    <li>寻找学习伙伴或老师指导</li>
                    <li>保持积极的学习态度</li>
                </ul>
            </div>
        `;
    }
    
    feedbackContent.innerHTML = feedback;
}

// 设置事件监听器
function setupEventListeners() {
    const newExamBtn = document.getElementById('newExam');
    const reviewAnswersBtn = document.getElementById('reviewAnswers');
    const goHomeBtn = document.getElementById('goHome');
    
    if (newExamBtn) {
        newExamBtn.addEventListener('click', function() {
            // 清除之前的考试数据
            localStorage.removeItem('examResult');
            localStorage.removeItem('examAnswers');
            localStorage.removeItem('examData');
            localStorage.removeItem('examProgress');
            
            // 跳转到考试页面
            window.location.href = '/exam';
        });
    }
    
    if (reviewAnswersBtn) {
        reviewAnswersBtn.addEventListener('click', function() {
            // 跳转到答案页面
            window.location.href = '/answers.html';
        });
    }
    
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
}

// 添加一些动画效果
document.addEventListener('DOMContentLoaded', function() {
    const scoreCard = document.querySelector('.score-card');
    const sectionItems = document.querySelectorAll('.section-item');
    
    if (scoreCard) {
        scoreCard.style.animation = 'fadeIn 0.8s ease-out';
    }
    
    sectionItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}); 
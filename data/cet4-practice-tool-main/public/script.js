// 主页面的JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const startExamBtn = document.getElementById('startExam');
    
    if (startExamBtn) {
        startExamBtn.addEventListener('click', function() {
            // 显示加载状态
            startExamBtn.innerHTML = '<span class="loading"></span> 正在生成题目...';
            startExamBtn.disabled = true;
            
            // 跳转到考试页面
            setTimeout(() => {
                window.location.href = '/exam';
            }, 1000);
        });
    }
    
    // 添加一些动画效果
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}); 
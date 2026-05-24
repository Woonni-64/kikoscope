// 考试页面的JavaScript
let currentExam = null;
let startTime = null;
let timerInterval = null;

// 选词填空相关状态
let wfSelectedBlanks = []; // 存储每个空白选中的选项索引
let wfUsedOptions = [];   // 存储哪些选项已被使用
let wfActiveBlank = null; // 当前被激活的空白索引

document.addEventListener('DOMContentLoaded', function() {
    loadExam();
    startTimer();
});

// 加载考试题目
async function loadExam() {
    try {
        const response = await fetch('/api/exam');
        const result = await response.json();
        
        if (result.success) {
            currentExam = result.data;
            console.log("DEBUG Frontend: Loaded currentExam object:", currentExam);
            startTime = new Date();
            displayExam();
        } else {
            alert('加载题目失败，请刷新页面重试');
        }
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('网络错误，请检查连接后重试');
    }
}

// 显示考试内容
function displayExam() {
    if (!currentExam) return;
    console.log("DEBUG Frontend: Sections object in displayExam:", currentExam.sections);
    
    // 显示考试ID
    document.getElementById('examId').textContent = `考试ID: ${currentExam.id}`;
    
    // 显示选词填空
    displayWordFilling();
    
    // 显示段落匹配
    displayParagraphMatching();
    
    // 显示仔细阅读
    displayReadingComprehension();
    
    // 显示翻译
    displayTranslation();
    
    // 显示写作
    displayWriting();
}

// 显示选词填空
function displayWordFilling() {
    const section = currentExam.sections.wordFilling;
    // 健壮性检查
    if (!section || !Array.isArray(section.options) || !Array.isArray(section.blanks)) {
        document.getElementById('wf-passage').innerHTML = '<p style="color:red;">题目加载失败，请刷新或联系管理员。</p>';
        document.getElementById('wf-options').innerHTML = '';
        console.error('WordFilling section data is invalid:', section);
        return;
    }

    // 初始化或更新状态
    // 只有在新考试或空白数量改变时才初始化 wfSelectedBlanks，以保留用户选择
    if (!wfSelectedBlanks || wfSelectedBlanks.length !== section.blanks.length) {
        wfSelectedBlanks = Array(section.blanks.length).fill(null);
        // console.log("DEBUG WF: Initialized wfSelectedBlanks:", wfSelectedBlanks); // Removed log
    }
    // 每次渲染都重新计算 wfUsedOptions，确保其反映当前 wfSelectedBlanks 的状态
    wfUsedOptions = Array(section.options.length).fill(false);
    wfSelectedBlanks.forEach(idx => {
        if (idx !== null && typeof idx === 'number' && idx >= 0 && idx < section.options.length) {
            wfUsedOptions[idx] = true;
        }
    });
    // console.log("DEBUG WF: After update, wfUsedOptions:", wfUsedOptions); // Removed log
    // console.log("DEBUG WF: After update, wfSelectedBlanks:", wfSelectedBlanks); // Removed log

    // 渲染题干
    let blankCounter = 0;
    const passageHtml = section.passage.replace(/___(\d+)___/g, (match, p1) => {
        const currentBlankIndex = blankCounter++;
        const filledOptionIndex = wfSelectedBlanks[currentBlankIndex];
        const displayValue = (filledOptionIndex !== null && typeof filledOptionIndex === 'number' && filledOptionIndex >= 0 && filledOptionIndex < section.options.length)
                             ? section.options[filledOptionIndex]
                             : `___${p1}___`;
        // console.log(`DEBUG WF: Blank ${currentBlankIndex} (___${p1}___) displayValue:`, displayValue, "filledOptionIndex:", filledOptionIndex); // Removed log
        const isActive = wfActiveBlank === currentBlankIndex ? ' active' : '';
        return `<span class="wf-blank${isActive}" data-blank-index="${currentBlankIndex}">${displayValue}</span>`;
    });
    document.getElementById('wf-passage').innerHTML = passageHtml;

    // 绑定空白点击事件
    document.querySelectorAll('.wf-blank').forEach(el => {
        el.onclick = () => {
            const index = parseInt(el.dataset.blankIndex);
            if (wfActiveBlank === index) { // 再次点击当前激活的空白
                if (wfSelectedBlanks[index] !== null) { // 如果已填入答案，则取消
                    wfUsedOptions[wfSelectedBlanks[index]] = false;
                    wfSelectedBlanks[index] = null;
                }
                wfActiveBlank = null; // 取消激活
            } else {
                wfActiveBlank = index; // 激活当前空白
            }
            displayWordFilling(); // 重新渲染以更新状态
        };
    });

    // 渲染选项
    const optionsContainer = document.getElementById('wf-options');
    optionsContainer.innerHTML = '';
    section.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item' + (wfUsedOptions[index] ? ' disabled' : '');
        optionDiv.textContent = option;
        optionDiv.dataset.optionIndex = index;
        optionDiv.addEventListener('click', function() {
            if (wfUsedOptions[index] || wfActiveBlank === null) return; // 选项已用或未激活空白
            
            // 如果当前空白已有答案，则释放原选项
            if (wfSelectedBlanks[wfActiveBlank] !== null) {
                wfUsedOptions[wfSelectedBlanks[wfActiveBlank]] = false;
            }

            wfSelectedBlanks[wfActiveBlank] = index;
            wfUsedOptions[index] = true;
            wfActiveBlank = null; // 填充后取消激活
            displayWordFilling(); // 重新渲染以更新状态
        });
        optionsContainer.appendChild(optionDiv);
    });
}

// 显示段落匹配
function displayParagraphMatching() {
    const section = currentExam.sections.paragraphMatching;
    // console.log("DEBUG PM: Section received in displayParagraphMatching:", JSON.stringify(section, null, 2)); // Removed log
    // 健壮性检查
    if (!section || !Array.isArray(section.paragraphs) || !Array.isArray(section.questions)) {
        document.getElementById('pm-paragraphs').innerHTML = '<p style="color:red;">题目加载失败，请刷新或联系管理员。</p>';
        document.getElementById('pm-questions').innerHTML = '';
        console.error('ParagraphMatching section data is invalid:', section);
        return;
    }
    
    // 检查段落和问题数量
    if (section.paragraphs.length === 0) {
        document.getElementById('pm-paragraphs').innerHTML = '<p style="color:red;">段落数据为空，请刷新或联系管理员。</p>';
        document.getElementById('pm-questions').innerHTML = '';
        console.error('ParagraphMatching: No paragraphs found');
        return;
    }
    
    if (section.questions.length === 0) {
        document.getElementById('pm-paragraphs').innerHTML = '<p style="color:red;">问题数据为空，请刷新或联系管理员。</p>';
        document.getElementById('pm-questions').innerHTML = '';
        console.error('ParagraphMatching: No questions found');
        return;
    }
    
    const paragraphsContainer = document.getElementById('pm-paragraphs');
    const questionsContainer = document.getElementById('pm-questions');
    
    // 显示段落
    paragraphsContainer.innerHTML = '';
    section.paragraphs.forEach((paragraph, index) => {
        const paragraphDiv = document.createElement('div');
        paragraphDiv.className = 'paragraph';
        paragraphDiv.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${paragraph}`;
        paragraphsContainer.appendChild(paragraphDiv);
    });
    
    // 显示问题
    questionsContainer.innerHTML = '';
    section.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'matching-question';
        
        const select = document.createElement('select');
        select.innerHTML = '<option value="">请选择</option>';
        section.paragraphs.forEach((_, pIndex) => {
            const option = document.createElement('option');
            option.value = String.fromCharCode(65 + pIndex);
            option.textContent = String.fromCharCode(65 + pIndex);
            select.appendChild(option);
        });
        select.dataset.questionIndex = index; // 用于收集答案
        
        // 添加change事件监听器，用于实时保存进度
        select.addEventListener('change', function() {
            saveProgress();
        });
        
        questionDiv.innerHTML = `
            <span>${index + 1}. ${question.question}</span>
        `;
        questionDiv.appendChild(select);
        questionsContainer.appendChild(questionDiv);
    });
    
    console.log(`ParagraphMatching: Displayed ${section.paragraphs.length} paragraphs and ${section.questions.length} questions`);
}

// 显示仔细阅读
function displayReadingComprehension() {
    const section = currentExam.sections.readingComprehension;
    // console.log("DEBUG RC: Questions array in displayReadingComprehension:", JSON.stringify(section.questions, null, 2)); // Removed log
    // 健壮性检查
    if (!section || !section.passage || !Array.isArray(section.questions)) {
        document.getElementById('rc-passage').innerHTML = '<p style="color:red;">题目加载失败，请刷新或联系管理员。</p>';
        document.getElementById('rc-questions').innerHTML = '';
        console.error('ReadingComprehension section data is invalid:', section);
        return;
    }
    
    const passage = document.getElementById('rc-passage');
    const questionsContainer = document.getElementById('rc-questions');
    
    // 显示文章
    passage.textContent = section.passage;
    
    // 显示问题
    questionsContainer.innerHTML = '';
    section.questions.forEach((question, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'reading-question';
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'reading-options';
        
        // 健壮性检查: question.options 必须是数组
        if (!Array.isArray(question.options)) {
            console.warn(`ReadingComprehension question ${qIndex} has invalid options:`, question.options);
            optionsDiv.innerHTML = '<p style="color:orange;">选项数据异常。</p>';
        } else {
            // console.log(`DEBUG RC: Question ${qIndex} options:`, JSON.stringify(question.options, null, 2)); // Removed log
            question.options.forEach((option, oIndex) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'reading-option';
                optionDiv.innerHTML = `
                    <input type="radio" name="rc_${qIndex}" value="${oIndex}" id="rc_${qIndex}_${oIndex}">
                    <label for="rc_${qIndex}_${oIndex}">${option}</label>
                `;
                optionsDiv.appendChild(optionDiv);
            });
        }
        
        questionDiv.innerHTML = `<h4>${qIndex + 1}. ${question.question}</h4>`;
        questionDiv.appendChild(optionsDiv);
        questionsContainer.appendChild(questionDiv);
    });
}

// 显示翻译
function displayTranslation() {
    const section = currentExam.sections.translation;
    // 健壮性检查
    if (!section || !section.chinese) {
        document.getElementById('tr-chinese').innerHTML = '<p style="color:red;">题目加载失败，请刷新或联系管理员。</p>';
        document.getElementById('tr-answer').value = '';
        console.error('Translation section data is invalid:', section);
        return;
    }
    
    const chineseText = document.getElementById('tr-chinese');
    chineseText.textContent = section.chinese;
}

// 显示写作
function displayWriting() {
    const section = currentExam.sections.writing;
    // 健壮性检查
    if (!section || !section.topic || !section.tips) {
        document.getElementById('wr-topic').innerHTML = '<p style="color:red;">题目加载失败，请刷新或联系管理员。</p>';
        document.getElementById('wr-requirements').innerHTML = '';
        document.getElementById('wr-answer').value = '';
        console.error('Writing section data is invalid:', section);
        return;
    }
    
    document.getElementById('wr-topic').textContent = section.topic;
    document.getElementById('wr-requirements').textContent = section.tips;
    // 文本域内容不变，保持用户输入
}

// 启动计时器
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const examDuration = 60 * 60 * 1000; // 60分钟
    timerInterval = setInterval(() => {
        const elapsedTime = new Date() - startTime;
        const remainingTime = examDuration - elapsedTime;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timeLeft').textContent = '时间：00:00';
            alert('考试时间到！');
            submitExam(); // 时间到自动提交
            return;
        }

        const minutes = Math.floor(remainingTime / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        document.getElementById('timeLeft').textContent = `时间：${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 收集用户答案
function collectAnswers() {
    // 健壮性检查
    if (!currentExam || !currentExam.sections) {
        console.error('currentExam is null or missing sections');
        return {
            wordFilling: [],
            paragraphMatching: [],
            readingComprehension: [],
            translation: '',
            writing: ''
        };
    }

    const answers = {
        wordFilling: [],
        paragraphMatching: [],
        readingComprehension: [],
        translation: '',
        writing: ''
    };

    // 收集选词填空答案
    if (currentExam.sections.wordFilling && Array.isArray(wfSelectedBlanks)) {
        answers.wordFilling = wfSelectedBlanks.map(optionIndex => {
            // 根据 optionIndex 查找实际的单词值，或者标记为未选择
            return optionIndex !== null && currentExam.sections.wordFilling && currentExam.sections.wordFilling.options[optionIndex]
                   ? currentExam.sections.wordFilling.options[optionIndex]
                   : null; // 或者返回空字符串，取决于后端期望的格式
        });
    }

    // 收集段落匹配答案
    document.querySelectorAll('#pm-questions select').forEach(select => {
        answers.paragraphMatching.push(select.value);
    });

    // 收集仔细阅读答案
    if (currentExam.sections.readingComprehension && currentExam.sections.readingComprehension.questions) {
        currentExam.sections.readingComprehension.questions.forEach((question, qIndex) => {
            const selectedOption = document.querySelector(`input[name="rc_${qIndex}"]:checked`);
            answers.readingComprehension.push(selectedOption ? parseInt(selectedOption.value) : null);
        });
    }

    // 收集翻译答案
    answers.translation = document.getElementById('tr-answer').value;

    // 收集写作答案
    answers.writing = document.getElementById('wr-answer').value;

    console.log("DEBUG: Collected answers:", answers);
    return answers;
}

// 提交考试
async function submitExam() {
    const userAnswers = collectAnswers();
    try {
        // 禁用提交按钮防止重复点击
        const submitButton = document.getElementById('submitExam');
        submitButton.disabled = true;
        submitButton.textContent = '正在提交...';

        const response = await fetch('/api/submit-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ examId: currentExam.id, answers: userAnswers, startTime: startTime.toISOString() }),
        });

        const result = await response.json();

        if (result.success) {
            // 保存结果数据到localStorage
            localStorage.setItem('examResult', JSON.stringify({
                examId: currentExam.id,
                score: result.score,
                message: result.message,
                detailedResults: result.detailedResults,
                submitTime: new Date().toISOString()
            }));
            
            // 保存用户答案
            localStorage.setItem('examAnswers', JSON.stringify(userAnswers));
            
            // 保存考试数据
            localStorage.setItem('examData', JSON.stringify(currentExam));
            
            alert('提交成功！您的分数是：' + result.score);
            // 跳转到结果页面
            window.location.href = '/result.html';
        } else {
            alert('提交失败：' + (result.message || '未知错误'));
            submitButton.disabled = false; // 允许重新提交
            submitButton.textContent = '提交答案';
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        alert('网络错误，无法提交考试');
        document.getElementById('submitExam').disabled = false; // 允许重新提交
        document.getElementById('submitExam').textContent = '提交答案';
    }
}

// 保存进度
function saveProgress() {
    const userAnswers = collectAnswers();
    try {
        localStorage.setItem(`examProgress_${currentExam.id}`, JSON.stringify(userAnswers));
        // alert('进度已保存！'); // 移除此行
    } catch (e) {
        console.error('保存进度失败:', e);
        alert('保存进度失败，可能是浏览器存储空间不足。');
    }
}

// 显示保存成功提示
function showSaveConfirmation() {
    alert('进度已保存！');
}

// 恢复进度（如果存在）
function restoreProgress() {
    if (currentExam && currentExam.id) {
        const savedProgress = localStorage.getItem(`examProgress_${currentExam.id}`);
        if (savedProgress) {
            const answers = JSON.parse(savedProgress);

            // 恢复选词填空
            if (answers.wordFilling && Array.isArray(answers.wordFilling)) {
                // 需要将保存的单词值转换回 options 数组的索引
                if (currentExam.sections.wordFilling && Array.isArray(currentExam.sections.wordFilling.options)) {
                    wfSelectedBlanks = answers.wordFilling.map(savedWord => {
                        if (savedWord === null) return null;
                        const index = currentExam.sections.wordFilling.options.indexOf(savedWord);
                        return index !== -1 ? index : null;
                    });
                    // 重新计算 wfUsedOptions
                    wfUsedOptions = Array(currentExam.sections.wordFilling.options.length).fill(false);
                    wfSelectedBlanks.forEach(idx => {
                        if (idx !== null) {
                            wfUsedOptions[idx] = true;
                        }
                    });
                }
            }
            displayWordFilling(); // 重新渲染以更新状态

            // 恢复段落匹配
            if (answers.paragraphMatching && Array.isArray(answers.paragraphMatching)) {
                document.querySelectorAll('#pm-questions select').forEach((select, index) => {
                    if (answers.paragraphMatching[index] !== undefined) {
                        select.value = answers.paragraphMatching[index];
                    }
                });
            }

            // 恢复仔细阅读
            if (answers.readingComprehension && Array.isArray(answers.readingComprehension)) {
                answers.readingComprehension.forEach((selectedIndex, qIndex) => {
                    if (selectedIndex !== null) {
                        const radio = document.getElementById(`rc_${qIndex}_${selectedIndex}`);
                        if (radio) {
                            radio.checked = true;
                        }
                    }
                });
            }

            // 恢复翻译
            if (answers.translation) {
                document.getElementById('tr-answer').value = answers.translation;
            }

            // 恢复写作
            if (answers.writing) {
                document.getElementById('wr-answer').value = answers.writing;
            }
            console.log('进度已恢复。');
        }
    }
}

// 在页面完全加载并显示题目后，尝试恢复进度
// 注意：这个调用位置很重要，必须在所有题目渲染完成后才能尝试恢复
// 可以考虑将 restoreProgress 放入 displayExam 的末尾，或者使用 setTimeout

// 为了确保题目元素都已渲染，在 displayExam 调用完成后尝试恢复进度
document.addEventListener('DOMContentLoaded', function() {
    // ... (其他加载逻辑)
    // loadExam().then(() => {
    //     restoreProgress();
    // });
});

// 监听DOMContentLoaded后，在loadExam完成后调用restoreProgress，以确保题目元素存在。
const originalLoadExam = loadExam;
loadExam = async () => {
    await originalLoadExam();
    restoreProgress();
}; 
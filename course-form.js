document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('course-form');
    const urlParams = new URLSearchParams(window.location.search);
    
    // 如果是编辑模式，加载课程数据
    if (urlParams.has('id')) {
        loadCourseForEdit(urlParams.get('id'));
    }
    
    // 表单提交处理
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const courseData = {
            id: form.elements['course-id'].value || null,
            name: form.elements['course-name'].value.trim(),
            teacher: form.elements['course-teacher'].value.trim(),
            time: form.elements['course-time'].value.trim(),
            location: form.elements['course-location'].value.trim(),
            status: form.elements['course-status'].value
        };
        
        // 验证数据
        if (!validateCourseData(courseData)) {
            return;
        }
        
        try {
            // 禁用保存按钮防止重复提交
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
            
            // 保存课程
            const courseId = await saveCourse(courseData);
            
            // 显示成功消息并跳转
            showAlert('课程保存成功', 'success');
            setTimeout(() => {
                window.location.href = `course-detail.html?id=${courseId}`;
            }, 1500);
            
        } catch (error) {
            console.error('保存课程失败:', error);
            showAlert(`保存失败: ${error.message}`, 'error');
            
            // 重新启用保存按钮
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '保存课程';
        }
    });
});

/​**​
 * 加载课程数据用于编辑
 * @param {string} courseId 课程ID
 */
async function loadCourseForEdit(courseId) {
    try {
        const course = await getCourseById(courseId);
        if (!course) throw new Error('课程不存在');
        
        // 填充表单
        document.getElementById('course-id').value = course.id;
        document.getElementById('course-name').value = course.name;
        document.getElementById('course-teacher').value = course.teacher;
        document.getElementById('course-time').value = course.time;
        document.getElementById('course-location').value = course.location;
        document.getElementById('course-status').value = course.status;
        
        // 更新页面标题
        document.getElementById('form-title').textContent = '编辑课程';
        document.querySelector('h1').textContent = '编辑课程';
        
    } catch (error) {
        console.error('加载课程失败:', error);
        showAlert(`加载课程失败: ${error.message}`, 'error');
        window.location.href = 'course.html';
    }
}

/​**​
 * 验证课程数据
 * @param {Object} data 课程数据
 * @returns {boolean} 是否有效
 */
function validateCourseData(data) {
    if (!data.name) {
        showAlert('请输入课程名称', 'error');
        document.getElementById('course-name').focus();
        return false;
    }
    
    if (!data.time) {
        showAlert('请输入上课时间', 'error');
        document.getElementById('course-time').focus();
        return false;
    }
    
    if (!data.location) {
        showAlert('请输入上课地点', 'error');
        document.getElementById('course-location').focus();
        return false;
    }
    
    return true;
}
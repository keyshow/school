document.getElementById('course-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const courseData = {
        id: document.getElementById('course-id').value || null,
        name: document.getElementById('course-name').value.trim(),
        teacher: document.getElementById('course-teacher').value.trim(),
        time: document.getElementById('course-time').value.trim(),
        location: document.getElementById('course-location').value.trim(),
        status: document.getElementById('course-status').value
    };
    
    // 验证必填字段
    if (!courseData.name || !courseData.time || !courseData.location) {
        alert('请填写所有必填字段');
        return;
    }
    
    try {
        const saveButton = document.querySelector('#course-form button[type="submit"]');
        saveButton.disabled = true;
        saveButton.textContent = '保存中...';
        
        // 调用统一保存函数
        const courseId = await saveCourse(courseData);
        
        alert('课程保存成功');
        window.location.href = `course-detail.html?id=${courseId}`;
        
    } catch (error) {
        console.error('保存课程失败:', error);
        alert('保存课程失败: ' + error.message);
    } finally {
        const saveButton = document.querySelector('#course-form button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = '保存课程';
        }
    }
});


/​**​
 * 获取课程列表
 * @returns {Promise<Array>} - 返回课程数组
 */
async function getCourses() {
    try {
        // 首先尝试从API获取
        const response = await fetch('/api/courses');
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('API请求失败');
        
    } catch (error) {
        console.warn('API获取失败，使用LocalStorage:', error);
        
        // 从LocalStorage获取
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        // 按addedDate降序排序
        return courses.sort((a, b) => 
            new Date(b.addedDate) - new Date(a.addedDate)
        );
    }
}

/​**​
 * 根据ID获取单个课程
 * @param {number} id - 课程ID
 * @returns {Promise<Object|null>} - 返回课程对象或null
 */
async function getCourseById(id) {
    try {
        // 首先尝试从API获取
        const response = await fetch(`/api/courses/${id}`);
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('API请求失败');
        
    } catch (error) {
        console.warn('API获取失败，使用LocalStorage:', error);
        
        // 从LocalStorage查找
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        return courses.find(c => c.id == id) || null;
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    // 加载最近课程
    try {
        const courses = await getCourses();
        renderRecentCourses(courses.slice(0, 5)); // 只显示最近5门课程
        
    } catch (error) {
        console.error('加载课程失败:', error);
        document.querySelector('#recent-courses tbody').innerHTML = `
            <tr>
                <td colspan="5" class="error-message">
                    <i class="fas fa-exclamation-circle"></i> 加载课程数据失败
                </td>
            </tr>
        `;
    }
    
    // 退出按钮事件
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if (confirm('确定要退出登录吗？')) {
            // 清除登录状态并跳转到登录页
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    });
});

/​**​
 * 渲染最近课程表格
 * @param {Array} courses 课程数组
 */
function renderRecentCourses(courses) {
    const tbody = document.querySelector('#recent-courses tbody');
    tbody.innerHTML = '';
    
    if (courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    <i class="fas fa-info-circle"></i> 暂无课程数据
                </td>
            </tr>
        `;
        return;
    }
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="course-detail.html?id=${course.id}">${course.name}</a></td>
            <td>${course.teacher}</td>
            <td>${course.time}</td>
            <td>${course.location}</td>
            <td class="status ${getStatusClass(course.status)}">
                ${course.status}
            </td>
        `;
        tbody.appendChild(row);
    });
}

/​**​
 * 获取状态对应的CSS类名
 * @param {string} status 课程状态
 * @returns {string} CSS类名
 */
function getStatusClass(status) {
    const statusMap = {
        '进行中': 'active',
        '已结束': 'inactive',
        '未开始': 'pending'
    };
    return statusMap[status] || '';
}
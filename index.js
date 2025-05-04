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
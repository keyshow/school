/​**​
 * 统一保存课程数据函数
 * @param {Object} courseData - 课程数据对象
 * @returns {Promise<number>} - 返回课程ID
 */
async function saveCourse(courseData) {
    // 生成或保留ID
    if (!courseData.id) {
        courseData.id = Date.now();
    }
    
    // 设置时间戳
    courseData.updatedAt = new Date().toISOString();
    if (!courseData.addedDate) {
        courseData.addedDate = courseData.updatedAt;
    }
    
    try {
        // 首先尝试使用API保存
        const response = await fetch('/api/courses', {
            method: courseData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData)
        });
        
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        const result = await response.json();
        return result.id || courseData.id;
        
    } catch (apiError) {
        console.warn('API保存失败，回退到LocalStorage:', apiError);
        
        // 回退到LocalStorage方案
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        // 如果是编辑，先删除旧数据
        courses = courses.filter(c => c.id !== courseData.id);
        
        // 添加新课程
        courses.push(courseData);
        
        // 保存回LocalStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        return courseData.id;
    }
}
/​**​
 * 获取课程列表
 * @returns {Promise<Array>} 课程数组
 */
async function getCourses() {
    try {
        // 尝试从API获取
        const response = await fetch('/api/courses');
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('API请求失败');
        
    } catch (error) {
        console.warn('API获取失败，使用LocalStorage:', error);
        
        // 从LocalStorage获取
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        // 按添加日期排序(最新的在前)
        return courses.sort((a, b) => 
            new Date(b.addedDate) - new Date(a.addedDate)
        );
    }
}

/​**​
 * 根据ID获取单个课程
 * @param {number} id 课程ID
 * @returns {Promise<Object|null>} 课程对象或null
 */
async function getCourseById(id) {
    try {
        // 尝试从API获取
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

/​**​
 * 根据ID删除课程
 * @param {number} id 课程ID
 * @returns {Promise<boolean>} 是否删除成功
 */
async function deleteCourse(id) {
    try {
        // 尝试API删除
        const response = await fetch(`/api/courses/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) return true;
        throw new Error('API请求失败');
        
    } catch (error) {
        console.warn('API删除失败，使用LocalStorage:', error);
        
        // 从LocalStorage删除
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses = courses.filter(c => c.id != id);
        localStorage.setItem('courses', JSON.stringify(courses));
        
        return true;
    }
}

/​**​
 * 显示提示消息
 * @param {string} message 消息内容
 * @param {string} type 消息类型(success/error)
 */
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.prepend(alert);
    
    // 3秒后自动消失
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
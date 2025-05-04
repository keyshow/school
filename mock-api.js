// mock-api.js
(function() {
    // 模拟数据库
    const mockDatabase = {
        courses: []
    };
    
    // 保存原始fetch方法
    const originalFetch = window.fetch;
    
    // 重写fetch方法
    window.fetch = async function(url, options = {}) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 处理课程相关API
        if (url === '/api/courses') {
            // 获取课程列表
            if (options.method === 'GET' || !options.method) {
                return {
                    ok: true,
                    json: async () => [...mockDatabase.courses]
                };
            }
            
            // 创建课程
            if (options.method === 'POST') {
                const newCourse = JSON.parse(options.body);
                newCourse.id = Date.now();
                newCourse.addedDate = new Date().toISOString();
                newCourse.updatedAt = new Date().toISOString();
                
                mockDatabase.courses.push(newCourse);
                
                return {
                    ok: true,
                    json: async () => ({ id: newCourse.id })
                };
            }
            
            // 更新课程
            if (options.method === 'PUT') {
                const updatedCourse = JSON.parse(options.body);
                const index = mockDatabase.courses.findIndex(c => c.id === updatedCourse.id);
                
                if (index >= 0) {
                    mockDatabase.courses[index] = {
                        ...mockDatabase.courses[index],
                        ...updatedCourse,
                        updatedAt: new Date().toISOString()
                    };
                    
                    return {
                        ok: true,
                        json: async () => ({ id: updatedCourse.id })
                    };
                }
                
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Course not found' })
                };
            }
        }
        
        // 处理单个课程
        if (url.startsWith('/api/courses/')) {
            const id = parseInt(url.split('/').pop());
            const course = mockDatabase.courses.find(c => c.id === id);
            
            // 获取单个课程
            if (options.method === 'GET' || !options.method) {
                if (course) {
                    return {
                        ok: true,
                        json: async () => ({ ...course })
                    };
                }
                
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ error: 'Course not found' })
                };
            }
            
            // 删除课程
            if (options.method === 'DELETE') {
                mockDatabase.courses = mockDatabase.courses.filter(c => c.id !== id);
                
                return {
                    ok: true,
                    json: async () => ({ success: true })
                };
            }
        }
        
        // 其他请求使用原始fetch
        return originalFetch(url, options);
    };
    
    console.log('Mock API已启用');
})();
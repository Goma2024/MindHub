// 测试本地存储中的用户数据
console.log('=== 测试本地存储中的用户数据 ===');

// 检查本地存储中的appState
const appState = localStorage.getItem('appState');
console.log('1. 本地存储中是否存在appState:', !!appState);

if (appState) {
  try {
    const parsedState = JSON.parse(appState);
    console.log('2. 解析appState成功');
    console.log('3. 用户数量:', parsedState.users ? parsedState.users.length : 0);
    
    if (parsedState.users && parsedState.users.length > 0) {
      console.log('4. 用户列表:');
      parsedState.users.forEach((user, index) => {
        console.log(`   ${index + 1}. 邮箱: ${user.email}, 用户名: ${user.name}, 注册时间: ${user.createdAt}`);
      });
    } else {
      console.log('4. 没有找到用户数据');
    }
  } catch (error) {
    console.log('2. 解析appState失败:', error.message);
  }
} else {
  console.log('2. 本地存储中没有appState数据');
}

// 测试添加用户
console.log('\n=== 测试添加用户 ===');
const testUser = {
  id: `user-${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: '123456',
  name: '测试用户',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=test${Date.now()}`,
  createdAt: new Date(),
  subscription: 'free'
};

// 如果appState存在，添加用户；否则创建新的appState
if (appState) {
  try {
    const parsedState = JSON.parse(appState);
    const updatedUsers = parsedState.users ? [...parsedState.users, testUser] : [testUser];
    const updatedState = {
      ...parsedState,
      users: updatedUsers
    };
    localStorage.setItem('appState', JSON.stringify(updatedState));
    console.log('5. 添加测试用户成功');
    console.log('6. 新用户邮箱:', testUser.email);
    console.log('7. 新用户密码:', testUser.password);
  } catch (error) {
    console.log('5. 添加测试用户失败:', error.message);
  }
} else {
  // 创建新的appState
  const newState = {
    user: null,
    users: [testUser],
    knowledgeItems: [],
    importRecords: [],
    searchRecords: [],
    isLoading: false,
    darkMode: false,
    categories: ['工作方法', '技术', '自我提升', '学习笔记'],
    tags: ['时间管理', '效率', 'React', '前端', '阅读', '学习']
  };
  localStorage.setItem('appState', JSON.stringify(newState));
  console.log('5. 创建新的appState并添加测试用户成功');
  console.log('6. 新用户邮箱:', testUser.email);
  console.log('7. 新用户密码:', testUser.password);
}

// 再次检查用户数据
console.log('\n=== 再次检查用户数据 ===');
const updatedAppState = localStorage.getItem('appState');
if (updatedAppState) {
  try {
    const parsedState = JSON.parse(updatedAppState);
    console.log('8. 更新后的用户数量:', parsedState.users ? parsedState.users.length : 0);
    if (parsedState.users && parsedState.users.length > 0) {
      console.log('9. 最新的用户:');
      const lastUser = parsedState.users[parsedState.users.length - 1];
      console.log(`   邮箱: ${lastUser.email}, 用户名: ${lastUser.name}, 注册时间: ${lastUser.createdAt}`);
    }
  } catch (error) {
    console.log('8. 解析更新后的appState失败:', error.message);
  }
}

console.log('\n=== 测试完成 ===');
console.log('请在浏览器中打开应用，使用新创建的测试用户登录，然后重新启动开发服务器测试持久化功能。');

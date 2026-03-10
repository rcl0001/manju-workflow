// 本地存储工具类，统一管理所有持久化数据

// 保存数据
export const saveData = (key, value) => {
  try {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  } catch (err) {
    console.error('保存数据失败:', err);
    return false;
  }
};

// 获取数据
export const getData = (key, isObject = true) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return isObject ? JSON.parse(value) : value;
  } catch (err) {
    console.error('读取数据失败:', err);
    return null;
  }
};

// 删除数据
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error('删除数据失败:', err);
    return false;
  }
};

// 清空所有数据
export const clearAllData = () => {
  try {
    localStorage.removeItem('manju_novelText');
    localStorage.removeItem('manju_script');
    localStorage.removeItem('manju_charRefs');
    localStorage.removeItem('manju_sceneRefs');
    localStorage.removeItem('manju_videoPrompts');
    localStorage.removeItem('manju_finalVideo');
    return true;
  } catch (err) {
    console.error('清空数据失败:', err);
    return false;
  }
};

// 检查是否有未完成的进度
export const hasUnfinishedProgress = () => {
  return !!getData('manju_novelText');
};

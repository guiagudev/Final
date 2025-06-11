export const getUserGroups = () => {
    return JSON.parse(sessionStorage.getItem('userGroups') || '[]');
  };
  
  export const hasGroup = (groupName) => {
    return getUserGroups().includes(groupName);
  };
  
  export const hasAnyGroup = (groups = []) => {
    return groups.some((group) => hasGroup(group));
  };
  
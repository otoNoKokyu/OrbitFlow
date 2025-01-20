export type rqType = 'fetchUserProject'

export const fetchUserProjects = (condition: string) => {
    let query = `
    SELECT user_projects.id, p.name, p.id as projectId, u.first_name, u.last_name, u.email, r.role, r.role_id
    FROM user_projects
    LEFT JOIN users u ON user_projects.userId = u.user_id
    LEFT JOIN projects p ON user_projects.projectId = p.id
    LEFT JOIN roles r ON user_projects.roleId = r.role_id
`
    return condition? query += `WHERE ${condition} ;` : query
}

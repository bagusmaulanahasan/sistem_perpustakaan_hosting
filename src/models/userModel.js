
const db = require("../config/database");

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            "SELECT * FROM `users` WHERE `email` = ?",
            [email]
        );
        return rows[0];
    },

    create: async (username, email, password) => {
        const [result] = await db.execute(
            "INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)",
            [username, email, password, "anggota"]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            "SELECT * FROM `users` WHERE `id` = ?",
            [id]
        );
        return rows[0];
    },

    updateProfile: async (id, username, email) => {
        const [result] = await db.execute(
            "UPDATE users SET username = ?, email = ? WHERE id = ?",
            [username, email, id]
        );
        return result.affectedRows;
    },

    updatePassword: async (id, hashedPassword) => {
        const [result] = await db.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    findAllMembersWithBorrowingStats: async (searchTerm) => {
        let query = `
            SELECT
                u.id,
                u.username,
                u.email,
                COUNT(CASE WHEN b.return_date IS NULL AND b.borrow_date IS NOT NULL THEN 1 END) AS currently_borrowed,
                COUNT(CASE WHEN b.return_date IS NOT NULL AND b.return_date <= b.due_date THEN 1 END) AS on_time_returns,
                COUNT(CASE WHEN b.return_date IS NOT NULL AND b.return_date > b.due_date THEN 1 END) AS late_returns
            FROM users u
            LEFT JOIN borrowings b ON u.id = b.user_id
            WHERE u.role = 'anggota'
        `;
        const params = [];

        if (searchTerm) {
            query += ` AND (u.username LIKE ? OR u.email LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        query += ` GROUP BY u.id, u.username, u.email`;

        if (searchTerm) {
            if (searchTerm.toLowerCase() === 'meminjam') {
                query += ` HAVING currently_borrowed > 0`;
            } else if (searchTerm.toLowerCase() === 'tidak ada') {
                query += ` HAVING currently_borrowed = 0`;
            }
        }

        const [rows] = await db.execute(query, params);
        return rows;
    },
};

module.exports = User;

const Category = require("../models/categoryModel");

exports.listCategories = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const options = { searchTerm };

        const categories = await Category.findAll(options);
        const totalCategories = await Category.countAll(options);

        res.render("admin/categories/index", {
            categories,
            title: "Manajemen Kategori",
            count: totalCategories,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.getCreatePage = (req, res) => {
    res.render("admin/categories/create", {
        user: req.session.user,
        title: "Tambah Kategori",
    });
};

// exports.postCreateCategory = async (req, res) => {
//     try {
//         const { name } = req.body;
//         await Category.create(name);
//         res.redirect("/admin/categories");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Terjadi kesalahan saat menyimpan data");
//     }
// };

// ... kode sebelumnya

exports.postCreateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const trimmedName = name ? name.trim() : "";
        const validPattern = /^[A-Za-z0-9\s-]+$/;

        // --- VALIDASI SISI SERVER ---
        if (!trimmedName) {
            // Menggunakan status 400 (Bad Request)
            return res.status(400).send("Nama kategori tidak boleh kosong.");
        }

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return res
                .status(400)
                .send("Nama kategori harus antara 2 hingga 50 karakter.");
        }

        if (!validPattern.test(trimmedName)) {
            return res
                .status(400)
                .send(
                    "Nama kategori mengandung karakter yang tidak valid (Hanya huruf, angka, spasi, dan tanda hubung)."
                );
        }
        // --- AKHIR VALIDASI ---

        await Category.create(trimmedName);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat menyimpan data");
    }
};

// ... kode untuk getEditPage

exports.getEditPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Kategori tidak ditemukan");
        }
        res.render("admin/categories/edit", {
            category,
            user: req.session.user,
            title: "Edit Kategori",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

// exports.postUpdateCategory = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name } = req.body;
//         await Category.update(id, name);
//         res.redirect("/admin/categories");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Terjadi kesalahan saat mengupdate data");
//     }
// };

// ... kode untuk getEditPage

// exports.postUpdateCategory = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name } = req.body;
//         const trimmedName = name ? name.trim() : "";
//         // Membatasi angka agar tidak menjadi dominan dan memastikan ada karakter huruf.
//         // Pola: Harus diawali dengan huruf, diikuti oleh huruf, angka, spasi, atau tanda hubung,
//         // dan batas panjang total 30-40 karakter.
//         const validPattern = /^[A-Za-z][A-Za-z0-9\s-]{1,39}$/;

//         console.log("Input diterima:", trimmedName); // LOG 1: Cek Input

//         // --- VALIDASI SISI SERVER ---
//         if (!trimmedName) {
//             // Menggunakan status 400 (Bad Request)
//             return res.status(400).send("Nama kategori tidak boleh kosong.");
//         }

//         if (trimmedName.length < 2 || trimmedName.length > 50) {
//             console.log("Validasi Panjang GAGAL!"); // LOG 2: Cek Validasi Panjang
//             return res
//                 .status(400)
//                 .send("Nama kategori harus antara 2 hingga 50 karakter.");
//         }

//         if (!validPattern.test(trimmedName)) {
//             return res
//                 .status(400)
//                 .send(
//                     "Nama kategori mengandung karakter yang tidak valid (Hanya huruf, angka, spasi, dan tanda hubung)."
//                 );
//         }
//         // --- AKHIR VALIDASI ---

//         await Category.update(id, trimmedName);
//         console.log("Validasi LOLOS, data diupdate."); // LOG 3: Cek Lolos
//         res.redirect("/admin/categories");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Terjadi kesalahan saat mengupdate data");
//     }
// };

exports.postUpdateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const trimmedName = name ? name.trim() : "";
    // const validPattern = /^[A-Za-z0-9\s-]+$/;
    const validPattern = /^[A-Za-z][A-Za-z0-9\s-]{1,39}$/;
    let errorMessage = null; // Variabel untuk menyimpan pesan error

    // --- VALIDASI SISI SERVER ---
    if (!trimmedName) {
        errorMessage = "Nama kategori tidak boleh kosong.";
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
        errorMessage = "Nama kategori harus antara 2 hingga 50 karakter.";
    } else if (!validPattern.test(trimmedName)) {
        errorMessage =
            "Nama kategori mengandung karakter yang tidak valid (Hanya huruf, angka, spasi, dan tanda hubung).";
    }
    // --- AKHIR VALIDASI ---

    if (errorMessage) {
        // Jika ada error, ambil kembali data kategori untuk di-render
        try {
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).send("Kategori tidak ditemukan");
            }
            // Render ulang halaman edit, sertakan error dan data kategori
            return res.render("admin/categories/edit", {
                category: category,
                title: "Edit Kategori",
                user: req.session.user,
                error: errorMessage, // Meneruskan pesan error ke EJS
                // Anda mungkin juga ingin mengirim input yang gagal agar user tidak mengetik ulang:
                failedInput: trimmedName,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Terjadi kesalahan saat validasi.");
        }
    }

    // Jika validasi LOLOS
    try {
        await Category.update(id, trimmedName);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat mengupdate data");
    }
};

// ... kode untuk postDeleteCategory

exports.postDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.remove(id);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Gagal menghapus kategori. Pastikan tidak ada buku yang menggunakan kategori ini."
        );
    }
};

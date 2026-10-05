const userModel = require('../Models/UserSchema')

const updateUser = async (req, res) => {
    try {
        let { id } = req.params
        let { name, email, password, role } = req.body

        let user = await userModel.findById(id)
        if (!user) {
            res.json({
                message: "User not found",
                status: false
            })
        }

        let updatedUser = await userModel.findByIdAndUpdate(
            id,
            { name, email, password, role },
            { status: true }
        )

        res.json({
            message: "User updated successfully",
            status: true,
            data: updatedUser
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        let { id } = req.params

        let user = await userModel.findById(id)
        if (!user) {
            return res.json({
                message: "User not found",
                status: false
            })
        }

        await userModel.findByIdAndDelete(id)

        res.json({
            message: "User deleted successfully",
            status: true
        })

    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

const getAllUsers = async (req, res) => {
    try {
        let users = await userModel.find()

        res.json({
            message: "Users fetched successfully",
            status: true,
            data: users
        })
    } catch (error) {
        res.json({
            message: "Something went wrong",
            status: false,
            error: error.message
        })
    }
}

module.exports = { updateUser, deleteUser, getAllUsers }
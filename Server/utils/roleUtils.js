const userModel = require('../Models/UserSchema');
const exhibitorModel = require('../Models/ExhibitorSchema');

/**
 * @param {string} userId - The ID of the user to check.
 */
    const recalculateUserRole = async (userId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user || user.role === 'admin') return;

        // Find all approved exhibitor records for this user
        const exhibitorRecords = await exhibitorModel.find({ 
            userId, 
            status: 'approved' 
        }).populate('eventId');

        // Check if any of these records belong to an event that is still active
        const hasActiveExhibitorRole = exhibitorRecords.some(record => 
            record.eventId && (record.eventId.status === 'upcoming' || record.eventId.status === 'ongoing')
        );

        const newRole = hasActiveExhibitorRole ? 'exhibitor' : 'attendee';

        if (user.role !== newRole) {
            await userModel.findByIdAndUpdate(userId, { role: newRole });
            console.log(`User ${userId} role updated to ${newRole}`);
        }
    } catch (error) {
        console.error(`Error recalculating role for user ${userId}:`, error.message);
    }
};

module.exports = { recalculateUserRole };

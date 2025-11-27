import { Property, User } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

// Load property images
export const uploadPropertyImages = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!req.uploadedImages || req.uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'קובץ להעלאה לא סופק'
            });
        }

        // Find the property
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            // Delete uploaded files if no permission
            for (const image of req.uploadedImages) {
                try {
                    await deleteFromCloudinary(image.publicId);
                } catch (error) {
                    console.error('שגיאה במחיקת הקובץ:', error);
                }
            }

            return res.status(403).json({
                success: false,
                message: 'אין הרשאה לערוך נכס זה'
            });
        }

        // Update image order
        const currentImages = property.images || [];
        const nextOrder = currentImages.length;

        const updatedImages = req.uploadedImages.map((image, index) => ({
            ...image,
            order: nextOrder + index,
            isMain: currentImages.length === 0 && index === 0 // The first image is main if there are no others
        }));

        // Add new images to property
        property.images.push(...updatedImages);
        await property.save();

        res.json({
            success: true,
            message: 'תמונות הועלו בהצלחה',
            data: {
                images: updatedImages,
                totalImages: property.images.length
            }
        });

    } catch (error) {
        console.error('שגיאה בהעלאת תמונות:', error);

        // Delete uploaded files in case of error
        if (req.uploadedImages) {
            for (const image of req.uploadedImages) {
                try {
                    await deleteFromCloudinary(image.publicId);
                } catch (deleteError) {
                    console.error('שגיאה במחיקת הקובץ:', deleteError);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};

// Delete property image
export const deletePropertyImage = async (req, res) => {
    try {
        const { propertyId, imageId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאה לערוך נכס זה'
            });
        }

        // Find the image
        const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'התמונה לא נמצאה'
            });
        }

        const imageToDelete = property.images[imageIndex];

        // Удаляем файл из Cloudinary
        try {
            await deleteFromCloudinary(imageToDelete.publicId);
        } catch (cloudinaryError) {
            console.error('שגיאה במחיקת הקובץ מ-Cloudinary:', cloudinaryError);
        }

        // Remove image from database
        property.images.splice(imageIndex, 1);

        // If the deleted image was the main one and there are other images
        if (imageToDelete.isMain && property.images.length > 0) {
            property.images[0].isMain = true;
        }

        await property.save();

        res.json({
            success: true,
            message: 'התמונה נמחקה בהצלחה',
            data: {
                remainingImages: property.images.length
            }
        });

    } catch (error) {
        console.error('שגיאה במחיקת התמונה:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};

// Setting the main image
export const setMainPropertyImage = async (req, res) => {
    try {
        const { propertyId, imageId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאה לערוך נכס זה'
            });
        }

        // Reset all images as not main
        property.images.forEach(img => {
            img.isMain = img._id.toString() === imageId;
        });

        await property.save();

        res.json({
            success: true,
            message: 'התמונה הראשית הוגדרה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה בהגדרת התמונה הראשית:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};

// Replacing the order of property images
export const reorderPropertyImages = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { imageOrder } = req.body; // Array with image IDs in the desired order
        if (!Array.isArray(imageOrder)) {
            return res.status(400).json({
                success: false,
                message: 'פורמט הנתונים לשינוי הסדר שגוי'
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאה לערוך נכס זה'
            });
        }

        // Change the order of images
        imageOrder.forEach((imageId, index) => {
            const image = property.images.find(img => img._id.toString() === imageId);
            if (image) {
                image.order = index;
            }
        });

        // Sort images by the new order
        property.images.sort((a, b) => a.order - b.order);

        await property.save();

        res.json({
            success: true,
            message: 'סדר התמונות שונה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה בשינוי סדר התמונות:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};

// Load user avatar
export const uploadUserAvatar = async (req, res) => {
    try {
        if (!req.uploadedAvatar) {
            return res.status(400).json({
                success: false,
                message: 'קובץ להעלאה לא סופק'
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old avatar if exists
        if (user.avatar?.publicId) {
            try {
                await deleteFromCloudinary(user.avatar.publicId);
            } catch (error) {
                console.error('שגיאה במחיקת תמונת הפרופיל הישנה:', error);
            }
        }

        // Update user avatar
        user.avatar = req.uploadedAvatar;
        await user.save();

        res.json({
            success: true,
            message: 'תמונת הפרופיל הועלתה בהצלחה',
            data: {
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('שגיאה בהעלאת תמונת הפרופיל:', error);

        // Delete uploaded file in case of error
        if (req.uploadedAvatar) {
            try {
                await deleteFromCloudinary(req.uploadedAvatar.publicId);
            } catch (deleteError) {
                console.error('שגיאה במחיקת הקובץ:', deleteError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};

// Delete user avatar
export const deleteUserAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.avatar?.publicId) {
            return res.status(400).json({
                success: false,
                message: 'למשתמש אין תמונת פרופיל'
            });
        }

        // Delete avatar from Cloudinary
        try {
            await deleteFromCloudinary(user.avatar.publicId);
        } catch (cloudinaryError) {
            console.error('שגיאה במחיקה מ-Cloudinary:', cloudinaryError);
        }

        // Delete avatar from database
        user.avatar = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'תמונת הפרופיל נמחקה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה במחיקת תמונת הפרופיל:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה פנימית בשרת'
        });
    }
};
import { Property, User } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

// Загрузка изображений для объекта недвижимости
export const uploadPropertyImages = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!req.uploadedImages || req.uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Файлы для загрузки не предоставлены'
            });
        }

        // Находим объект недвижимости
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            // Удаляем загруженные файлы, если нет прав
            for (const image of req.uploadedImages) {
                try {
                    await deleteFromCloudinary(image.publicId);
                } catch (error) {
                    console.error('Ошибка удаления файла:', error);
                }
            }

            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого объекта'
            });
        }

        // Обновляем порядок изображений
        const currentImages = property.images || [];
        const nextOrder = currentImages.length;

        const updatedImages = req.uploadedImages.map((image, index) => ({
            ...image,
            order: nextOrder + index,
            isMain: currentImages.length === 0 && index === 0 // Первое изображение главное, если других нет
        }));

        // Добавляем новые изображения к существующим
        property.images.push(...updatedImages);
        await property.save();

        res.json({
            success: true,
            message: 'Изображения успешно загружены',
            data: {
                images: updatedImages,
                totalImages: property.images.length
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);

        // Удаляем загруженные файлы в случае ошибки
        if (req.uploadedImages) {
            for (const image of req.uploadedImages) {
                try {
                    await deleteFromCloudinary(image.publicId);
                } catch (deleteError) {
                    console.error('Ошибка удаления файла:', deleteError);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Удаление изображения объекта недвижимости
export const deletePropertyImage = async (req, res) => {
    try {
        const { propertyId, imageId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого объекта'
            });
        }

        // Находим изображение
        const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Изображение не найдено'
            });
        }

        const imageToDelete = property.images[imageIndex];

        // Удаляем файл из Cloudinary
        try {
            await deleteFromCloudinary(imageToDelete.publicId);
        } catch (cloudinaryError) {
            console.error('Ошибка удаления из Cloudinary:', cloudinaryError);
        }

        // Удаляем изображение из базы данных
        property.images.splice(imageIndex, 1);

        // Если удаляемое изображение было главным и есть другие изображения
        if (imageToDelete.isMain && property.images.length > 0) {
            property.images[0].isMain = true;
        }

        await property.save();

        res.json({
            success: true,
            message: 'Изображение успешно удалено',
            data: {
                remainingImages: property.images.length
            }
        });

    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Установка главного изображения
export const setMainPropertyImage = async (req, res) => {
    try {
        const { propertyId, imageId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого объекта'
            });
        }

        // Сбрасываем все изображения как не главные
        property.images.forEach(img => {
            img.isMain = img._id.toString() === imageId;
        });

        await property.save();

        res.json({
            success: true,
            message: 'Главное изображение успешно установлено'
        });

    } catch (error) {
        console.error('Ошибка установки главного изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Изменение порядка изображений
export const reorderPropertyImages = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { imageOrder } = req.body; // Массив с ID изображений в нужном порядке

        if (!Array.isArray(imageOrder)) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат данных для изменения порядка'
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого объекта'
            });
        }

        // Изменяем порядок изображений
        imageOrder.forEach((imageId, index) => {
            const image = property.images.find(img => img._id.toString() === imageId);
            if (image) {
                image.order = index;
            }
        });

        // Сортируем изображения по новому порядку
        property.images.sort((a, b) => a.order - b.order);

        await property.save();

        res.json({
            success: true,
            message: 'Порядок изображений успешно изменен'
        });

    } catch (error) {
        console.error('Ошибка изменения порядка изображений:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Загрузка аватара пользователя
export const uploadUserAvatar = async (req, res) => {
    try {
        if (!req.uploadedAvatar) {
            return res.status(400).json({
                success: false,
                message: 'Файл для загрузки не предоставлен'
            });
        }

        const user = await User.findById(req.user._id);

        // Удаляем старый аватар, если он есть
        if (user.avatar?.publicId) {
            try {
                await deleteFromCloudinary(user.avatar.publicId);
            } catch (error) {
                console.error('Ошибка удаления старого аватара:', error);
            }
        }

        // Обновляем аватар пользователя
        user.avatar = req.uploadedAvatar;
        await user.save();

        res.json({
            success: true,
            message: 'Аватар успешно загружен',
            data: {
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);

        // Удаляем загруженный файл в случае ошибки
        if (req.uploadedAvatar) {
            try {
                await deleteFromCloudinary(req.uploadedAvatar.publicId);
            } catch (deleteError) {
                console.error('Ошибка удаления файла:', deleteError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Удаление аватара пользователя
export const deleteUserAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.avatar?.publicId) {
            return res.status(400).json({
                success: false,
                message: 'У пользователя нет аватара'
            });
        }

        // Удаляем аватар из Cloudinary
        try {
            await deleteFromCloudinary(user.avatar.publicId);
        } catch (cloudinaryError) {
            console.error('Ошибка удаления из Cloudinary:', cloudinaryError);
        }

        // Удаляем аватар из базы данных
        user.avatar = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Аватар успешно удален'
        });

    } catch (error) {
        console.error('Ошибка удаления аватара:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};
import { Request, Response } from 'express';
import BotanicInventory from '../models/Botanic';

export const createBotanicInventory = async (req: Request, res: Response) => {
  try {
    const count = await BotanicInventory.countDocuments(); // Check current number of documents, up to a max of 50
    if (count >= 50) {
      return res.status(400).json({ message: 'Límite máximo de 50 módulos alcanzado. Elimina alguno para agregar uno nuevo.' });
    }

    const { name } = req.body;// Check unique name
    const existing = await BotanicInventory.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un módulo con ese nombre.' });
    }

    const newInventory = new BotanicInventory(req.body);
    const savedInventory = await newInventory.save();

    return res.status(201).json({ message: 'Inventario creado correctamente.', inventory: savedInventory });
  } catch (error) {
    console.error(error);
        return res.status(500).json({ message: 'Error al crear inventario.' });
  }
};

export const getAllInventories = async (req: Request, res: Response) => {
  try {
    const inventories = await BotanicInventory.find();
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventarios.' });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const inventory = await BotanicInventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventario no encontrado.' });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventario.' });
  }
};

export const updateInventoryByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    // Verificar que no se duplique el 'name' si lo actualizan
    if (req.body.name) {
      const existing = await BotanicInventory.findOne({
        name: req.body.name,
        plantName: { $ne: name } // Solo revisa duplicados en otros documentos
      });

      if (existing) {
        return res.status(409).json({ message: 'Ya existe otro módulo con ese nombre.' });
      }
    }

    const updatedInventory = await BotanicInventory.findOneAndUpdate(
      { name },
      req.body,
      { new: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: 'Planta no encontrada.' });
    }

    res.json({ message: 'Planta actualizada.', updatedInventory });

  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar planta.' });
  }
};

export const deletePlantFromInventoryByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const deleted = await BotanicInventory.findOneAndDelete({ name });
    if (!deleted) return res.status(404).json({ message: 'Planta no encontrada.' });

    res.json({ message: 'Planta eliminada correctamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar planta.' });
  }
};
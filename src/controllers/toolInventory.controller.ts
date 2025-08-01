import { ToolInventory } from '../models/Tool';
import { Request, Response } from 'express';

// Create Tool
export const createTool = async (req: Request, res: Response) => {
  try {
    const { toolName, description } = req.body;

    // Check if the tool already exists
    const existingTool = await ToolInventory.findOne({ toolName });
    if (existingTool) {
      return res.status(400).json({ message: "Tool already exists" });
    }

    const newTool = new ToolInventory({ toolName, description });
    const tool = await newTool.save();

    return res.status(201).json({ tool });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get All Tools
export const getAllTools = async (_req: Request, res: Response) => {
  try {
    const tools = await ToolInventory.find({ status: true }).sort({ createDate: -1 });
    return res.status(200).json({ tools });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get Tool by ID
export const getToolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await ToolInventory.findById(id);

    if (!tool || tool.status === false) {
      return res.status(404).json({ message: "Tool not found" });
    }

    return res.status(200).json({ tool });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Update Tool
export const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { toolName, description } = req.body;

    const tool = await ToolInventory.findById(id);
    if (!tool || tool.status === false) {
      return res.status(404).json({ message: "Tool not found" });
    }

    if (toolName && toolName !== tool.toolName) {
      const existing = await ToolInventory.findOne({ toolName });
      if (existing) {
        return res.status(400).json({ message: "Another tool with the same name already exists" });
      }
    }

    tool.toolName = toolName ?? tool.toolName;
    tool.description = description ?? tool.description;

    const updatedTool = await tool.save();
    return res.status(200).json({ tool: updatedTool });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Soft Delete Tool
export const deleteTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tool = await ToolInventory.findById(id);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    if (tool.status === false) {
      return res.status(400).json({ message: "Tool is already deleted" });
    }

    tool.status = false;
    await tool.save();

    return res.status(200).json({ message: "Tool deleted", tool });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
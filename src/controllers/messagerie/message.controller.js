const MessageService = require('../../services/messagerie/message.service');

exports.envoyerMessage = async (req, res) => {
  try {
    const result = await MessageService.envoyerMessage(req.user.id, req.body);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur envoyerMessage:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const messages = await MessageService.getConversation(req.user.id, req.params.userId);
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Erreur getConversation:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await MessageService.getConversations(req.user.id);
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.marquerLu = async (req, res) => {
  try {
    const result = await MessageService.marquerLu(req.params.messageId, req.user.id);
    if (!result.success) return res.status(404).json({ message: result.message });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur marquerLu:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getNbNonLus = async (req, res) => {
  try {
    const result = await MessageService.getNbNonLus(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur getNbNonLus:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

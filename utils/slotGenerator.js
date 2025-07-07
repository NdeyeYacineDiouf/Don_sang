// Utilitaire pour générer des créneaux horaires pour une campagne

/**
 * Génère des créneaux horaires pour une campagne
 * @param {Object} campaign - L'objet campagne 
 * @param {Number} duration - Durée d'un créneau en minutes (défaut: 60)
 * @returns {Array} - Liste des créneaux générés
 */
function generateSlots(campaign, duration = 60) {
    const slots = [];
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    // Convertir les heures de début et de fin en minutes depuis minuit
    const [startHour, startMin] = campaign.startTime.split(':').map(Number);
    const [endHour, endMin] = campaign.endTime.split(':').map(Number);
    
    const campaignStartMinutes = startHour * 60 + startMin;
    const campaignEndMinutes = endHour * 60 + endMin;
    
    // Pour chaque jour de la campagne
    for (let currentDate = new Date(startDate); currentDate <= endDate; 
         currentDate.setDate(currentDate.getDate() + 1)) {
      
      // Pour chaque créneau horaire possible dans la journée
      for (let timeSlotStart = campaignStartMinutes; 
           timeSlotStart + duration <= campaignEndMinutes; 
           timeSlotStart += duration) {
        
        const timeSlotEnd = timeSlotStart + duration;
        
        // Formater les heures pour le créneau
        const startTimeHour = Math.floor(timeSlotStart / 60);
        const startTimeMin = timeSlotStart % 60;
        
        const endTimeHour = Math.floor(timeSlotEnd / 60);
        const endTimeMin = timeSlotEnd % 60;
        
        const formattedStartTime = `${startTimeHour.toString().padStart(2, '0')}:${startTimeMin.toString().padStart(2, '0')}`;
        const formattedEndTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMin.toString().padStart(2, '0')}`;
        
        // Créer l'objet créneau
        const slot = {
          campaign: campaign._id,
          day: new Date(currentDate),
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          maxPeople: campaign.maxPeoplePerSlot,
          reserved: 0
        };
        
        slots.push(slot);
      }
    }
    
    return slots;
  }
  
  /**
   * Crée les créneaux pour une campagne et les enregistre en base de données
   * @param {Object} campaign - La campagne
   * @param {Object} Slot - Le modèle Mongoose Slot
   * @param {Number} duration - Durée d'un créneau en minutes
   * @returns {Promise} - Promise avec les créneaux créés
   */
  async function createSlotsForCampaign(campaign, Slot, duration = 60) {
    try {
      // Générer les créneaux
      const slotsToCreate = generateSlots(campaign, duration);
      
      // Sauvegarder les créneaux en base
      const createdSlots = await Slot.insertMany(slotsToCreate);
      
      // Mettre à jour la campagne avec les références aux créneaux
      campaign.slots = createdSlots.map(slot => slot._id);
      await campaign.save();
      
      return createdSlots;
    } catch (error) {
      console.error("Erreur lors de la création des créneaux:", error);
      throw error;
    }
  }
  
  module.exports = {
    generateSlots,
    createSlotsForCampaign
  };
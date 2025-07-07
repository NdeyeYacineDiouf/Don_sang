const Campaign = require('../models/campaign');
const Slot = require('../models/slot');
const { createSlotsForCampaign } = require('../utils/slotGenerator');

// Liste toutes les campagnes
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Détails d'une campagne
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée' });

        // Récupérer les créneaux associés à la campagne
        const slots = await Slot.find({ campaign: campaign._id }).sort({ day: 1, startTime: 1 });

        res.json({ campaign, slots }); // Retourner la campagne et ses créneaux
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Créer une nouvelle campagne
exports.createCampaign = async (req, res) => {
    try {
        const { 
            title, description, startDate, endDate, 
            startTime, endTime, location, maxPeoplePerSlot,
            generateSlots, slotDuration,
            locationAddress, locationLat, locationLng, locationPlaceId
        } = req.body;

        // Créer la campagne
        const newCampaign = new Campaign({
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            locationDetails: {
                address: locationAddress,
                coordinates: {
                    lat: locationLat ? parseFloat(locationLat) : null,
                    lng: locationLng ? parseFloat(locationLng) : null
                },
                place_id: locationPlaceId
            },
            maxPeoplePerSlot
        });

        const savedCampaign = await newCampaign.save();

        // Si l'option de génération automatique est activée
        if (generateSlots) {
            await createSlotsForCampaign(
                savedCampaign, 
                Slot,
                parseInt(slotDuration || 60)
            );
        }

        res.status(201).json(savedCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Modifier une campagne
exports.updateCampaign = async (req, res) => {
    try {
        const {
            title, description, startDate, endDate, 
            startTime, endTime, location, maxPeoplePerSlot,
            locationAddress, locationLat, locationLng, locationPlaceId
        } = req.body;

        // Debug temporaire
        console.log('🔍 Données de localisation reçues:', {
            location,
            locationAddress,
            locationLat,
            locationLng,
            locationPlaceId
        });

        const updateData = {
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            maxPeoplePerSlot
        };

        // Ajouter les détails de localisation si fournis
        if (locationAddress || locationLat || locationLng || locationPlaceId) {
            updateData.locationDetails = {
                address: locationAddress,
                coordinates: {
                    lat: locationLat ? parseFloat(locationLat) : null,
                    lng: locationLng ? parseFloat(locationLng) : null
                },
                place_id: locationPlaceId
            };
        }

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée' });
        
        // Debug temporaire - vérifier la campagne sauvegardée
        console.log('✅ Campagne mise à jour:', {
            title: campaign.title,
            location: campaign.location,
            locationDetails: campaign.locationDetails
        });
        
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer une campagne
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        
        if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée' });
        
        // Supprimer également tous les créneaux associés
        await Slot.deleteMany({ campaign: req.params.id });
        
        res.json({ message: 'Campagne supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
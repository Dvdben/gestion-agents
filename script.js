// Configuration Supabase
const supabaseUrl = 'https://gbnotarigfteynwchmnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdibm90YXJpZ2Z0ZXlud2NobW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTg0OTgsImV4cCI6MjA3ODA5NDQ5OH0.kOyYb-wql3FTLe5iD5l-oup3FDk1Jb1xCgGpK3fQFCA';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fonction pour afficher les popups
function afficherPopup(type, titre, message, details = '') {
    // Créer le popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px;
        border-radius: 10px;
        color: white;
        font-family: Arial, sans-serif;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
    `;

    // Couleur selon le type
    if (type === 'erreur') {
        popup.style.background = 'linear-gradient(135deg, #ff4757, #ff3838)';
    } else if (type === 'succes') {
        popup.style.background = 'linear-gradient(135deg, #2ed573, #1e90ff)';
    } else if (type === 'warning') {
        popup.style.background = 'linear-gradient(135deg, #ffa502, #ff7f50)';
    } else {
        popup.style.background = 'linear-gradient(135deg, #747d8c, #57606f)';
    }

    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 18px;">${titre}</h3>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; margin: 0;">
                ×
            </button>
        </div>
        <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.4;">${message}</p>
        ${details ? `<pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; font-size: 12px; margin: 0; overflow: auto; max-height: 100px;">${details}</pre>` : ''}
    `;

    // Ajouter au body
    document.body.appendChild(popup);

    // Supprimer automatiquement après 8 secondes
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 8000);
}

// Test de connexion immédiat
async function testerConnexion() {
    afficherPopup('warning', '🔍 Test en cours', 'Connexion à Supabase...');
    
    try {
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .limit(1);
        
        if (error) {
            afficherPopup('erreur', '❌ Erreur de connexion', 
                'Impossible de se connecter à la base de données', 
                JSON.stringify(error, null, 2));
        } else {
            afficherPopup('succes', '✅ Connexion réussie', 
                'Connexion à Supabase établie avec succès !');
        }
    } catch (err) {
        afficherPopup('erreur', '❌ Exception', 
            'Erreur inattendue lors de la connexion', 
            err.toString());
    }
}

// Éléments DOM
const form = document.getElementById('form-agent');
const listeContainer = document.getElementById('liste-agents-container');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    afficherPopup('warning', '⚡ Initialisation', 'Lancement de l\'application...');
    testerConnexion();
    chargerAgents();
});

// Soumission formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const poste = document.getElementById('poste').value.trim();
    
    if (!prenom || !nom || !poste) {
        afficherPopup('warning', '⚠️ Champ manquant', 'Veuillez remplir tous les champs');
        return;
    }
    
    const nouvelAgent = { prenom, nom, poste };
    afficherPopup('warning', '➕ Ajout en cours', `Tentative d'ajout de: ${prenom} ${nom}`);

    try {
        const { data, error } = await supabase
            .from('agents')
            .insert([nouvelAgent])
            .select();

        if (error) {
            afficherPopup('erreur', '❌ Erreur d\'insertion', 
                'Impossible d\'ajouter l\'agent à la base de données', 
                JSON.stringify(error, null, 2));
        } else {
            afficherPopup('succes', '✅ Succès !', 
                `Agent "${prenom} ${nom}" ajouté avec succès`);
            form.reset();
            chargerAgents();
        }
    } catch (err) {
        afficherPopup('erreur', '❌ Exception', 
            'Erreur inattendue lors de l\'ajout', 
            err.toString());
    }
});

// Charger les agents
async function chargerAgents() {
    afficherPopup('warning', '📥 Chargement', 'Récupération de la liste des agents...');
    
    try {
        const { data: agents, error } = await supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            afficherPopup('erreur', '❌ Erreur de chargement', 
                'Impossible de charger les agents', 
                JSON.stringify(error, null, 2));
                
            listeContainer.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    <h3>❌ Erreur de chargement</h3>
                    <p>${error.message}</p>
                </div>
            `;
            return;
        }

        afficherPopup('succes', '📋 Chargement réussi', 
            `${agents.length} agent(s) chargé(s)`);
        afficherAgents(agents);
        
    } catch (err) {
        afficherPopup('erreur', '❌ Exception', 
            'Erreur lors du chargement', 
            err.toString());
    }
}

// Afficher les agents
function afficherAgents(agents) {
    listeContainer.innerHTML = '';
    
    if (agents.length === 0) {
        listeContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>📝 Aucun agent</h3>
                <p>Ajoutez votre premier agent ci-dessus</p>
            </div>
        `;
        return;
    }

    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-info">
                <h3>${agent.prenom} ${agent.nom}</h3>
                <p>${agent.poste}</p>
                <small>ID: ${agent.id}</small>
            </div>
            <button class="btn-supprimer" onclick="supprimerAgent(${agent.id}, '${agent.prenom} ${agent.nom}')">
                🗑️ Supprimer
            </button>
        `;
        listeContainer.appendChild(agentCard);
    });
}

// Supprimer un agent
window.supprimerAgent = async (id, nomComplet) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${nomComplet}" ?`)) return;

    afficherPopup('warning', '🗑️ Suppression', `Suppression de "${nomComplet}"...`);

    try {
        const { error } = await supabase
            .from('agents')
            .delete()
            .eq('id', id);

        if (error) {
            afficherPopup('erreur', '❌ Erreur de suppression', 
                'Impossible de supprimer l\'agent', 
                JSON.stringify(error, null, 2));
        } else {
            afficherPopup('succes', '✅ Supprimé !', 
                `"${nomComplet}" a été supprimé avec succès`);
            chargerAgents();
        }
    } catch (err) {
        afficherPopup('erreur', '❌ Exception', 
            'Erreur lors de la suppression', 
            err.toString());
    }
};

// Fonction pour forcer le test de connexion (utile pour debug)
window.testConnexionManuelle = () => {
    afficherPopup('warning', '🔄 Test manuel', 'Lancement du test de connexion...');
    testerConnexion();
};

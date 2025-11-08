// Configuration Supabase
const supabaseUrl = 'https://gbnotarigfteynwchmnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdibm90YXJpZ2Z0ZXlud2NobW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTg0OTgsImV4cCI6MjA3ODA5NDQ5OH0.kOyYb-wql3FTLe5iD5l-oup3FDk1Jb1xCgGpK3fQFCA';

// Vérification que Supabase est chargé
function verifierSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase non chargé');
        return false;
    }
    return true;
}

// Initialisation sécurisée
let supabaseClient;
function initialiserSupabase() {
    if (!verifierSupabase()) {
        throw new Error('Bibliothèque Supabase non disponible');
    }
    
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialisé');
    return supabaseClient;
}

// Test de connexion
async function testerConnexion() {
    console.log('🔍 Test de connexion Supabase...');
    
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ ERREUR RLS/Connexion:', error);
            afficherErreur(error);
            return false;
        } else {
            console.log('✅ Connexion réussie! RLS configuré correctement');
            return true;
        }
    } catch (err) {
        console.error('❌ Exception:', err);
        return false;
    }
}

function afficherErreur(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ff4444; 
        color: white; 
        padding: 15px; 
        margin: 10px 0; 
        border-radius: 5px;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <h3>❌ Erreur Supabase</h3>
        <p><strong>Message:</strong> ${error.message}</p>
        <p><strong>Code:</strong> ${error.code || 'N/A'}</p>
        <p><strong>Détails:</strong> ${error.details || 'N/A'}</p>
        <p><strong>Solution:</strong> Vérifiez les politiques RLS dans Supabase</p>
    `;
    document.body.prepend(errorDiv);
}

// Éléments DOM
let form, listeContainer;

function initialiserElementsDOM() {
    form = document.getElementById('form-agent');
    listeContainer = document.getElementById('liste-agents-container');
    
    if (!form || !listeContainer) {
        console.error('❌ Éléments DOM non trouvés');
        return false;
    }
    return true;
}

// Initialisation principale
async function initialiserApplication() {
    try {
        if (!initialiserElementsDOM()) return;
        
        initialiserSupabase();
        const connexionReussie = await testerConnexion();
        
        if (connexionReussie) {
            await chargerAgents();
            initialiserFormulaire();
        }
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
}

// Initialisation formulaire
function initialiserFormulaire() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const prenom = document.getElementById('prenom').value.trim();
        const nom = document.getElementById('nom').value.trim();
        const poste = document.getElementById('poste').value.trim();
        
        if (!prenom || !nom || !poste) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        const nouvelAgent = { prenom, nom, poste };
        console.log('➕ Tentative ajout:', nouvelAgent);

        try {
            const { data, error } = await supabaseClient
                .from('agents')
                .insert([nouvelAgent])
                .select();

            if (error) {
                console.error('❌ Erreur insertion détaillée:', error);
                
                if (error.code === '42501') {
                    alert('Erreur de permissions RLS. Vérifiez les politiques dans Supabase.');
                } else {
                    alert('Erreur: ' + error.message);
                }
            } else {
                console.log('✅ Agent ajouté:', data);
                form.reset();
                await chargerAgents();
                alert('✅ Agent ajouté avec succès!');
            }
        } catch (err) {
            console.error('❌ Exception:', err);
            alert('Erreur inattendue: ' + err.message);
        }
    });
}

// Charger les agents
async function chargerAgents() {
    console.log('📥 Chargement des agents...');
    
    try {
        const { data: agents, error } = await supabaseClient
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erreur chargement:', error);
            listeContainer.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    <h3>❌ Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <p><em>Code: ${error.code || 'N/A'}</em></p>
                </div>
            `;
            return;
        }

        console.log(`📋 ${agents.length} agent(s) chargé(s)`);
        afficherAgents(agents);
        
    } catch (err) {
        console.error('❌ Exception chargement:', err);
    }
}

// Afficher les agents
function afficherAgents(agents) {
    listeContainer.innerHTML = '';
    
    if (agents.length === 0) {
        listeContainer.innerHTML = '<p class="text-center">Aucun agent enregistré</p>';
        return;
    }

    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-info">
                <h3>${agent.prenom} ${agent.nom}</h3>
                <p>${agent.poste}</p>
                <small>ID: ${agent.id} | Créé le: ${new Date(agent.created_at).toLocaleDateString()}</small>
            </div>
            <button class="btn-supprimer" onclick="supprimerAgent(${agent.id})">
                ️ Supprimer
            </button>
        `;
        listeContainer.appendChild(agentCard);
    });
}

// Supprimer un agent
window.supprimerAgent = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;

    try {
        const { error } = await supabaseClient
            .from('agents')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Erreur suppression:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        } else {
            console.log('✅ Agent supprimé');
            await chargerAgents();
        }
    } catch (err) {
        console.error('❌ Exception suppression:', err);
    }
};

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initialiserApplication);

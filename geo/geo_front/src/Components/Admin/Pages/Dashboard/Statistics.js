import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend, ComposedChart, Area,
    Line,
    LineChart
} from "recharts";
import {
    DownloadOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    MoneyCollectOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    TeamOutlined,
    FieldTimeOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import axios from "axios";
import ArLogo from "../ArLogo/ArLogo";

const { Title, Text } = Typography;
const { Option } = Select;

// MiniStatCard avec ligne rouge si "Reste à Percevoir"
const MiniStatCard = ({ title, amount, data, icon, color, isMoney = true }) => {
    const lineColor = color || "#1890ff";

    return (
        <Card
            style={{ borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", height: "100%" }}
            bodyStyle={{ padding: 16 }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <Text style={{ color: "#999", fontSize: "14px" }}>{title}</Text>
                    <Title level={4} style={{ color: lineColor, margin: "8px 0" }}>
                        {isMoney ? `${amount.toLocaleString()} Ar` : amount}
                    </Title>
                </div>
                <div style={{ fontSize: 28, color: lineColor }}>{icon}</div>
            </div>
            <ResponsiveContainer width="100%" height={40}>
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey={title === "Reste à Percevoir" ? "reste" : "value"}
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

const Statistics = () => {
    const [dateRange, setDateRange] = useState('semaine');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [users, setUsers] = useState([]);
    const [paiements, setPaiements] = useState([]);
    const [situations, setSituations] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const COLORS = ['#82ca9d', '#8884d8', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

    // Obtenir l'année en cours
    const currentYear = new Date().getFullYear();

    // Générer les années disponibles (depuis 2025 jusqu'à l'année en cours)
    const availableYears = Array.from(
        { length: currentYear - 2025 + 1 },
        (_, i) => 2025 + i
    );

    // Fonction pour charger les données statistiques
    const fetchStatistics = async () => {
        const token = localStorage.getItem('token') || '';

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const [
                usersResponse,
                paiementsResponse,
                situationsResponse,
                clientsResponse
            ] = await Promise.allSettled([
                axios.get('http://127.0.0.1:8000/api/users/dataChart', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://127.0.0.1:8000/api/paiements', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://127.0.0.1:8000/api/situations/${dateRange}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://127.0.0.1:8000/api/clients', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Traitement des réponses
            if (usersResponse.status === 'fulfilled') {
                const usersData = Array.isArray(usersResponse.value.data)
                    ? usersResponse.value.data
                    : usersResponse.value.data?.data || [];
                setUsers(usersData);
            }

            if (paiementsResponse.status === 'fulfilled') {
                const paiementsData = Array.isArray(paiementsResponse.value.data)
                    ? paiementsResponse.value.data
                    : paiementsResponse.value.data?.data || [];
                setPaiements(paiementsData);
            }

            if (situationsResponse.status === 'fulfilled') {
                const situationsData = Array.isArray(situationsResponse.value.data)
                    ? situationsResponse.value.data
                    : situationsResponse.value.data?.data || [];
                setSituations(situationsData);
            }

            if (clientsResponse.status === 'fulfilled') {
                const clientsData = Array.isArray(clientsResponse.value.data)
                    ? clientsResponse.value.data
                    : clientsResponse.value.data?.data || [];
                setClients(clientsData);
            }

        } catch (error) {
            console.error('Erreur statistiques:', error);
            message.error("Erreur lors du chargement des données statistiques.");
        } finally {
            setLoading(false);
        }
    };

    // Calcul des statistiques financières avancées
    const calculateAdvancedFinancialStats = () => {
        const clientsAvecPremierPaiement = {};
        const ventesSuperieures = paiements.filter(p => {
            const clientId = p.client_id;
            const montant = parseFloat(p.montant) || 0;

            if (!clientsAvecPremierPaiement[clientId] && montant >= 30000) {
                clientsAvecPremierPaiement[clientId] = true;
                return true;
            }
            return false;
        });

        const totalPaiements = paiements.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
        const chiffreAffaireTotal = clients.reduce((sum, client) =>
            sum + (parseFloat(client.montant) || 0), 0
        );
        const montantVentesSuperieures = ventesSuperieures.reduce((sum, vente) =>
            sum + (parseFloat(vente.montant) || 0), 0
        );

        // Filtrer par période
        const maintenant = new Date();
        let dateDebut = new Date();

        switch (dateRange) {
            case 'semaine':
                dateDebut.setDate(maintenant.getDate() - 7);
                break;
            case 'mois':
                dateDebut.setMonth(maintenant.getMonth() - 1);
                break;
            case 'année':
                if (selectedYear === currentYear) {
                    dateDebut = new Date(currentYear, 0, 1);
                } else {
                    dateDebut = new Date(selectedYear, 0, 1);
                }
                break;
            default:
                dateDebut = new Date(0);
        }

        const ventesPeriod = ventesSuperieures.filter(vente => {
            const dateVente = new Date(vente.date || vente.created_at);
            if (dateRange === 'année' && selectedYear !== currentYear) {
                return dateVente.getFullYear() === selectedYear;
            }
            return dateVente >= dateDebut;
        });

        const paiementsPeriod = paiements.filter(p => {
            const datePaiement = new Date(p.date || p.created_at);
            if (dateRange === 'année' && selectedYear !== currentYear) {
                return datePaiement.getFullYear() === selectedYear;
            }
            return datePaiement >= dateDebut;
        });

        const totalPaiementsPeriod = paiementsPeriod.reduce((sum, p) =>
            sum + (parseFloat(p.montant) || 0), 0
        );

        return {
            ventesSuperieures: ventesSuperieures.length,
            montantVentesSuperieures,
            totalPaiements,
            totalPaiementsPeriod,
            chiffreAffaireTotal,
            ventesPeriod: ventesPeriod.length,
            montantVentesPeriod: ventesPeriod.reduce((sum, v) => sum + (parseFloat(v.montant) || 0), 0),
            resteAPercevoir: chiffreAffaireTotal - totalPaiements,
            tauxRecouvrement: chiffreAffaireTotal > 0 ? (totalPaiements / chiffreAffaireTotal) * 100 : 0,
        };
    };

    // Calcul des données pour les graphiques
    const calculateStatistics = () => {
        const agentsPerformance = situations.map(agent => ({
            name: agent.pseudo || 'Agent',
            ventes: agent.vente || 0,
            visites: agent.visite || 0,
            presentations: agent.presentation || 0,
            commandes_travaux: agent.commande_travaux || 0,
            travaux_debut: agent.travaux_debut || 0,
            relances: agent.relance || 0,
        }));

        const performanceDetails = situations.map(agent => ({
            name: agent.pseudo || 'Agent',
            Présentations: agent.presentation || 0,
            Visites: agent.visite || 0,
            Ventes: agent.vente || 0,
            'Commandes Travaux': agent.commande_travaux || 0,
            'Début Travaux': agent.travaux_debut || 0,
            Relances: agent.relance || 0,
        }));

        const financialData = calculateFinancialData();
        const financialStats = calculateAdvancedFinancialStats();

        return {
            agentsPerformance,
            performanceDetails,
            financialData,
            financialStats
        };
    };

    // Générer les mois depuis janvier de l'année sélectionnée
    const generateMonthsForSelectedYear = () => {
        const months = [];
        const today = new Date();

        let endMonth = 11;
        if (selectedYear === currentYear) {
            endMonth = today.getMonth();
        }

        for (let month = 0; month <= endMonth; month++) {
            const date = new Date(selectedYear, month, 1);
            const monthName = date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short'
            });
            months.push({
                mois: monthName,
                paiements: 0,
                ventes: 0,
                premierPaiements: 0,
                resteAPercevoir: 0 // Nouveau champ pour le reste à percevoir
            });
        }
        return months;
    };

    // Calcul des données financières AVEC reste à percevoir
    const calculateFinancialData = () => {
        const monthsForYear = generateMonthsForSelectedYear();
        const monthlyData = {};

        monthsForYear.forEach(month => {
            monthlyData[month.mois] = { ...month };
        });

        if (paiements.length > 0) {
            const clientsTraites = {};
            
            // Calculer le chiffre d'affaire cumulé par mois
            const chiffreAffaireCumuleParMois = {};
            let chiffreAffaireCumule = 0;

            // D'abord, calculer le chiffre d'affaire cumulé
            clients.forEach(client => {
                try {
                    let dateCreation;
                    
                    if (client.created_at) {
                        dateCreation = new Date(client.created_at);
                    } else {
                        return;
                    }

                    if (isNaN(dateCreation.getTime()) || dateCreation.getFullYear() !== selectedYear) {
                        return;
                    }

                    const monthKey = dateCreation.toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short'
                    });

                    if (monthlyData[monthKey]) {
                        const montantClient = parseFloat(client.montant) || 0;
                        chiffreAffaireCumule += montantClient;
                        
                        // Stocker le chiffre d'affaire cumulé pour ce mois
                        chiffreAffaireCumuleParMois[monthKey] = chiffreAffaireCumule;
                    }

                } catch (error) {
                    console.error('Erreur traitement client:', error);
                }
            });

            // Ensuite, traiter les paiements
            paiements.forEach(p => {
                try {
                    let date;

                    if (p.date) {
                        date = new Date(p.date);
                    } else if (p.created_at) {
                        date = new Date(p.created_at);
                    } else {
                        return;
                    }

                    if (isNaN(date.getTime()) || date.getFullYear() !== selectedYear) {
                        return;
                    }

                    const monthKey = date.toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short'
                    });

                    if (monthlyData[monthKey]) {
                        const montant = parseFloat(p.montant) || 0;
                        monthlyData[monthKey].paiements += montant;

                        const clientId = p.client_id;
                        if (clientId) {
                            const estPremierPaiement = !clientsTraites[clientId];
                            clientsTraites[clientId] = true;

                            if (estPremierPaiement && montant >= 30000) {
                                monthlyData[monthKey].ventes += montant;
                                monthlyData[monthKey].premierPaiements += 1;
                            }
                        }
                    }

                } catch (error) {
                    console.error('Erreur traitement paiement:', error);
                }
            });

            // Calculer le reste à percevoir par mois
            let paiementsCumules = 0;
            const result = Object.values(monthlyData).map(monthData => {
                paiementsCumules += monthData.paiements;
                
                // Trouver le chiffre d'affaire cumulé pour ce mois
                const chiffreAffaireCumule = chiffreAffaireCumuleParMois[monthData.mois] || 
                    Object.values(chiffreAffaireCumuleParMois).pop() || 0;
                
                return {
                    ...monthData,
                    resteAPercevoir: Math.max(0, chiffreAffaireCumule - paiementsCumules)
                };
            });

            return result;
        }

        return Object.values(monthlyData);
    };

    // Export CSV
    const exportCSV = () => {
        const stats = calculateStatistics();
        const header = "Mois,Paiements,Ventes,Nombre Ventes,Reste à Percevoir\n";
        const csv = stats.financialData
            .map((d) => `${d.mois},${d.paiements},${d.ventes},${d.premierPaiements},${d.resteAPercevoir}`)
            .join("\n");
        const csvContent = `data:text/csv;charset=utf-8,${header}${csv}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `statistiques_${selectedYear}_${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("Données exportées avec succès!");
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login");
            return;
        }

        fetchStatistics();
    }, [dateRange, selectedYear, navigate]);

    const stats = calculateStatistics();

    const getPeriodText = () => {
        switch (dateRange) {
            case 'semaine': return "Cette Semaine";
            case 'mois': return "Ce Mois";
            case 'année': return selectedYear === currentYear ? "Cette Année" : `Année ${selectedYear}`;
            default: return "Toutes Périodes";
        }
    };

    const getFinancialChartTitle = () => {
        if (dateRange === 'année') {
            return `Évolution Financière - ${selectedYear}`;
        }
        return `Évolution Financière (Depuis Janvier ${selectedYear})`;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Card
                loading={loading}
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={3} style={{ margin: 0 }}>
                            Tableaux de Statistiques - {getPeriodText()}
                        </Title>
                        <div>
                            <Select
                                value={dateRange}
                                onChange={setDateRange}
                                style={{ width: 150, marginRight: 10 }}
                            >
                                <Option value="semaine">Cette Semaine</Option>
                                <Option value="mois">Ce Mois</Option>
                                <Option value="année">Année</Option>
                            </Select>

                            {dateRange === 'année' && (
                                <Select
                                    value={selectedYear}
                                    onChange={setSelectedYear}
                                    style={{ width: 120, marginRight: 10 }}
                                >
                                    {availableYears.map(year => (
                                        <Option key={year} value={year}>
                                            {year}
                                        </Option>
                                    ))}
                                </Select>
                            )}

                            <Button icon={<DownloadOutlined />} onClick={exportCSV}>
                                Export CSV
                            </Button>
                            <Link to="/admin/dashboard">
                                <Button style={{ marginLeft: 10 }}>Retour</Button>
                            </Link>
                        </div>
                    </div>
                }
            >
                {/* Cartes de statistiques principales */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col span={6} style={{ backgroundColor: '#48d483' }}>
                        <MiniStatCard
                            title="Ventes ≥ 30,000 Ar"
                            amount={stats.financialStats.ventesSuperieures}
                            data={stats.financialData.map((d) => ({ value: d.premierPaiements }))}
                            icon={<ShoppingCartOutlined />}
                            color="#52c41a"
                            isMoney={false}
                        />
                    </Col>
                    <Col span={6} style={{ backgroundColor: 'orange' }}>
                        <MiniStatCard
                            title="Paiements Totaux"
                            amount={stats.financialStats.totalPaiements}
                            data={stats.financialData.map((d) => ({ value: d.paiements }))}
                            icon={<ArLogo size={25}  />}
                            color="#1890ff"
                        />
                    </Col>
                    <Col span={6} style={{ backgroundColor: '#48d483' }}>
                        <MiniStatCard
                            title="Chiffre d'Affaire"
                            amount={stats.financialStats.chiffreAffaireTotal}
                            data={stats.financialData.map((d) => ({ value: d.ventes }))}
                            icon={<ArLogo size={25}  />}
                            color="#fa8c16"
                        />
                    </Col>
                    <Col span={6}style={{ backgroundColor: 'orange' }}>
                        <MiniStatCard
                            title="Reste à Percevoir"
                            amount={stats.financialStats.resteAPercevoir}
                            data={stats.financialData.map((d) => ({ reste: d.resteAPercevoir }))}
                            icon={<ArLogo size={25} />}
                            color="#f5222d"
                        />
                    </Col>
                </Row>

                {/* Graphique financier principal AVEC reste à percevoir */}
                <Card
                    title={
                        <Title level={4} style={{ margin: 0 }}>
                            <BarChartOutlined /> {getFinancialChartTitle()}
                        </Title>
                    }
                    style={{ marginBottom: 24, borderRadius: 12 }}
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart
                            data={stats.financialData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                                    return value;
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    name.includes('Ventes') || name.includes('Paiements') || name.includes('Reste') ?
                                        `${value.toLocaleString()}` : value,
                                    name
                                ]}
                            />
                            <Legend />
                            {/* Aire pour les paiements totaux */}
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="paiements"
                                fill="#8884d8"
                                stroke="#8884d8"
                                fillOpacity={0.3}
                                name="Paiements Totaux"
                            />
                            {/* Barres pour les ventes */}
                            <Line
                                yAxisId="left"
                                dataKey="ventes"
                                fill="#82ca9d"
                                radius={[4, 4, 0, 0]}
                                name="Ventes (Montant ≥30k)"
                            />
                            {/* Ligne pour le nombre de ventes */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="premierPaiements"
                                stroke="#ff7300"
                                strokeWidth={3}
                                name="Nombre de Ventes"
                                dot={{ fill: '#ff7300', strokeWidth: 3, r: 4 }}
                            />
                            {/* Ligne pour le reste à percevoir */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="resteAPercevoir"
                                stroke="#f5222d"
                                strokeWidth={3}
                                name="Reste à Percevoir"
                                strokeDasharray="5 5"
                                dot={{ fill: '#f5222d', strokeWidth: 2, r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>

                    {stats.financialData.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            Aucune donnée financière disponible pour {selectedYear}
                        </div>
                    )}
                </Card>

                {/* Performance des agents */}
                <Card
                    title={
                        <Title level={4} style={{ margin: 0 }}>
                            <TeamOutlined color="skyblue" /> Performance des Agents - {getPeriodText()}
                        </Title>
                    }
                    style={{ borderRadius: 12 }}
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={stats.performanceDetails}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Ventes" fill="#52c41a" name="Ventes" barSize={20} bar />
                            <Bar dataKey="Visites" fill="#1890ff" name="Visites" barSize={20}/>
                            <Bar dataKey="Présentations" fill="#fa8c16" name="Présentations" barSize={20}/>
                            <Bar dataKey="Commandes Travaux" fill="#722ed1" name="Commandes Travaux" barSize={20}/>
                            <Bar dataKey="Début Travaux" fill="#13c2c2" name="Travaux" barSize={20}/>
                            <Bar dataKey="Relances" fill="#eb2f96" name="Relances" barSize={20}/>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Card>
        </motion.div>
    );
};

export default Statistics;

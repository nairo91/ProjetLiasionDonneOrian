using System;
using System.Collections.Generic;
using System.Reflection;
using Npgsql;
using NpgsqlTypes;

class ProgrammeRH
{
    // --- CONFIGURATION ---
    static string Host = "localhost";
    static string Username = "postgres";
    static string Password = "dba1234*";
    static string Database = "gestionrh"; // Base 'gestionrh'
    static string ChaineConnect = @$"Host={Host};Port=5432;Username={Username};Password={Password};Database={Database}";

    //menu
    static List<string> textesMenu = new List<string>();
    static List<string> nomsMethodes = new List<string>();
    static string RoleActuel = "";

    static void InitialiserMenu()
    {
        textesMenu.Clear();
        nomsMethodes.Clear();

        textesMenu.Add("Afficher les employés actifs");
        nomsMethodes.Add("AfficherEmployes");


        if (RoleActuel == "Admin" || RoleActuel == "Gestionnaire")
        {
            textesMenu.Add("Ajouter un nouvel employé");
            nomsMethodes.Add("AjouterEmploye");
            textesMenu.Add("Créer un Contrat pour un employé");
            nomsMethodes.Add("AjouterContrat");
            textesMenu.Add("Ajouter un Avenant à un contrat");
            nomsMethodes.Add("AjouterAvenant");
            textesMenu.Add("Supprimer un employé (Logique)");
            nomsMethodes.Add("SupprimerLogique");
        }

        //admin seulement
        if (RoleActuel == "Admin")
        {

        }


        textesMenu.Add("Quitter l'application");
        nomsMethodes.Add("QuitterApp");
    }

    static void AfficherMenu()
    {
        Console.Clear();
        Console.WriteLine($"--- GESTION RH (Base: {Database} | Rôle: {RoleActuel}) ---");
        for (int i = 0; i < textesMenu.Count; i++)
        {
            Console.WriteLine($"{i + 1} - {textesMenu[i]}");
        }
        Console.Write("Votre choix : ");
    }

    //connexion
    static bool SeConnecter()
    {
        Console.Clear();
        Console.WriteLine("=== AUTHENTIFICATION RH ===");

        Console.Write("Identifiant : ");
        string login = Console.ReadLine();

        Console.Write("Mot de passe : ");
        string pass = "";
        while (true)
        {
            var key = Console.ReadKey(true);
            if (key.Key == ConsoleKey.Enter) break;
            pass += key.KeyChar;
            Console.Write("*");
        }
        Console.WriteLine();

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();
                string ReqSQL = "SELECT Role FROM Utilisateurs WHERE Identifiant = @log AND MotDePasse = @pass";

                using (var cmd = new NpgsqlCommand(ReqSQL, Connect))
                {
                    cmd.Parameters.AddWithValue("@log", login);
                    cmd.Parameters.AddWithValue("@pass", pass);

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            RoleActuel = reader.GetString(0);
                            Console.WriteLine($"Connexion réussie ! Bienvenue {login} ({RoleActuel}).");
                            System.Threading.Thread.Sleep(1500);
                            return true;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Erreur de connexion : " + ex.Message);
            Console.ReadLine();
            return false;
        }

        Console.WriteLine("Identifiant ou mot de passe incorrect.");
        Console.ReadLine();
        return false;
    }

    static void Main(string[] args)
    {
        if (!SeConnecter()) return;

        InitialiserMenu();

        while (true)
        {
            AfficherMenu();
            string choixLu = Console.ReadLine();

            if (int.TryParse(choixLu, out int choix) && choix >= 1 && choix <= nomsMethodes.Count)
            {
                string nomMethode = nomsMethodes[choix - 1];
                if (nomMethode == "QuitterApp") break;

                MethodInfo methodInfo = typeof(ProgrammeRH).GetMethod(nomMethode, BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public);

                if (methodInfo != null)
                {
                    try { methodInfo.Invoke(null, null); }
                    catch (Exception ex) { Console.WriteLine("Erreur : " + ex.Message); Console.ReadLine(); }
                }
            }
            else
            {
                Console.WriteLine("Choix invalide.");
                Console.ReadLine();
            }
        }
    }



    static void AfficherEmployes()
    {
        Console.Clear();
        Console.WriteLine("Liste des employés actifs :");

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();
                string ReqSQL = "SELECT NumEmpl, NomEmpl, PrenomEmpl, Fonction FROM Employes WHERE supprime = false";

                using (var cmdSQL = new NpgsqlCommand(ReqSQL, Connect))
                using (var Liste = cmdSQL.ExecuteReader())
                {
                    if (!Liste.HasRows) Console.WriteLine("Aucun employé trouvé.");

                    while (Liste.Read())
                    {
                        Console.WriteLine($"ID: {Liste["NumEmpl"]} | {Liste["NomEmpl"]} {Liste["PrenomEmpl"]} ({Liste["Fonction"]})");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur SQL : {ex.Message}");
        }
        Console.WriteLine("\nAppuyez sur Entrée pour revenir au menu...");
        Console.ReadLine();
    }

    static void AjouterEmploye()
    {
        Console.Clear();
        Console.WriteLine("Ajout d'un employé :");

        Console.Write("Nom : ");
        string nom = Console.ReadLine();
        Console.Write("Prénom : ");
        string prenom = Console.ReadLine();
        Console.Write("Fonction : ");
        string fonction = Console.ReadLine();

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();
                string ReqSQL = "INSERT INTO Employes (NomEmpl, PrenomEmpl, Fonction, supprime) VALUES (@nom, @prenom, @fonc, false)";

                using (var cmdSQL = new NpgsqlCommand(ReqSQL, Connect))
                {
                    cmdSQL.Parameters.AddWithValue("@nom", nom.ToUpper());
                    cmdSQL.Parameters.AddWithValue("@prenom", prenom);
                    cmdSQL.Parameters.AddWithValue("@fonc", fonction);

                    int nb = cmdSQL.ExecuteNonQuery();
                    Console.WriteLine($"{nb} employé ajouté avec succès !");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur SQL : {ex.Message}");
        }
        Console.WriteLine("\nAppuyez sur Entrée...");
        Console.ReadLine();
    }

    static void AjouterContrat()
    {
        Console.Clear();
        Console.WriteLine("--- Création d'un Contrat ---");

        Console.Write("ID de l'employé concerné : ");
        if (!int.TryParse(Console.ReadLine(), out int numEmpl))
        {
            Console.WriteLine("ID invalide."); return;
        }

        Console.Write("Date de début (JJ/MM/AAAA) : ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime dateDebut))
        {
            Console.WriteLine("Date invalide."); return;
        }

        Console.Write("Date de fin (JJ/MM/AAAA) (Laisser vide si CDI) : ");
        string dateFinStr = Console.ReadLine();
        object dateFinVal = DBNull.Value;

        if (!string.IsNullOrWhiteSpace(dateFinStr) && DateTime.TryParse(dateFinStr, out DateTime dateFin))
        {
            dateFinVal = dateFin;
        }

        Console.Write("Salaire mensuel : ");
        if (!decimal.TryParse(Console.ReadLine(), out decimal salaire))
        {
            Console.WriteLine("Montant invalide."); return;
        }

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();
                string ReqSQL = "INSERT INTO Contrat (DateDebut, DateFin, Salaire, NumEmpl) VALUES (@dd, @df, @sal, @empl)";

                using (var cmd = new NpgsqlCommand(ReqSQL, Connect))
                {
                    cmd.Parameters.AddWithValue("@dd", dateDebut);
                    cmd.Parameters.AddWithValue("@df", dateFinVal);
                    cmd.Parameters.AddWithValue("@sal", salaire);
                    cmd.Parameters.AddWithValue("@empl", numEmpl);

                    try
                    {
                        cmd.ExecuteNonQuery();
                        Console.WriteLine("Contrat créé avec succès !");
                    }
                    catch (PostgresException ex)
                    {
                        if (ex.SqlState == "23503") // cours page 29
                            Console.WriteLine("Erreur : Cet ID d'employé n'existe pas.");
                        else
                            throw;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur : {ex.Message}");
        }
        Console.WriteLine("Appuyez sur Entrée...");
        Console.ReadLine();
    }

    static void AjouterAvenant()
    {
        Console.Clear();
        Console.WriteLine("Nouvel Avenant au Contrat : ");

        Console.Write("Numéro du Contrat concerné : ");
        if (!int.TryParse(Console.ReadLine(), out int numContrat))
        {
            Console.WriteLine("Numéro invalide."); return;
        }

        Console.Write("Date de l'avenant (JJ/MM/AAAA) : ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime dateAv))
        {
            Console.WriteLine("Date invalide."); return;
        }

        Console.Write("Nouvelle Fonction : ");
        string fonction = Console.ReadLine();

        Console.Write("Nouveau Salaire : ");
        if (!decimal.TryParse(Console.ReadLine(), out decimal salaire))
        {
            Console.WriteLine("Montant invalide."); return;
        }

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();

                //Calc N Ordre (MAX + 1)
                string ReqCalcul = "SELECT COALESCE(MAX(NumOrdre), 0) FROM Avenant WHERE NumContrat = @id";
                int prochainOrdre = 1;

                using (var cmdCalcul = new NpgsqlCommand(ReqCalcul, Connect))
                {
                    cmdCalcul.Parameters.AddWithValue("@id", numContrat);
                    object resultat = cmdCalcul.ExecuteScalar();
                    if (resultat != null) prochainOrdre = Convert.ToInt32(resultat) + 1;
                }

                //Insert Avenant
                string ReqInsert = "INSERT INTO Avenant (NumContrat, NumOrdre, DateAvenant, Fonction, Salaire) VALUES (@nc, @no, @da, @fct, @sal)";

                using (var cmd = new NpgsqlCommand(ReqInsert, Connect))
                {
                    cmd.Parameters.AddWithValue("@nc", numContrat);
                    cmd.Parameters.AddWithValue("@no", prochainOrdre);
                    cmd.Parameters.AddWithValue("@da", dateAv);
                    cmd.Parameters.AddWithValue("@fct", fonction);
                    cmd.Parameters.AddWithValue("@sal", salaire);

                    try
                    {
                        cmd.ExecuteNonQuery();
                        Console.WriteLine($"Avenant N°{prochainOrdre} ajouté au contrat {numContrat} avec succès.");
                    }
                    catch (PostgresException ex)
                    {
                        if (ex.SqlState == "23503")
                            Console.WriteLine("Erreur : Ce numéro de contrat n'existe pas.");
                        else
                            throw;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur : {ex.Message}");
        }
        Console.WriteLine("Appuyez sur Entrée...");
        Console.ReadLine();
    }

    static void SupprimerLogique()
    {
        Console.Clear();
        Console.WriteLine("--- Suppression Logique d'un Employé ---");

        Console.Write("ID de l'employé à supprimer : ");
        if (!int.TryParse(Console.ReadLine(), out int id)) return;

        try
        {
            using (var Connect = new NpgsqlConnection(ChaineConnect))
            {
                Connect.Open();
                string ReqSQL = "UPDATE Employes SET supprime = true WHERE NumEmpl = @id";

                using (var cmdSQL = new NpgsqlCommand(ReqSQL, Connect))
                {
                    cmdSQL.Parameters.AddWithValue("@id", id);
                    int nbModif = cmdSQL.ExecuteNonQuery();

                    if (nbModif > 0)
                        Console.WriteLine($"Employé {id} marqué comme supprimé.");
                    else
                        Console.WriteLine("Aucun employé trouvé avec cet ID.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur : {ex.Message}");
        }
        Console.WriteLine("Appuyez sur Entrée...");
        Console.ReadLine();
    }
}
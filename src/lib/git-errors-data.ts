import type { ErrorEntry } from "./error-types";

export const gitErrors: ErrorEntry[] = [
  {
    id: "git-merge-conflict",
    name: "CONFLICT (content)",
    message: "Automatic merge failed; fix conflicts and then commit the result",
    cause: "Deux branches ont modifié les mêmes lignes du même fichier de manière différente.",
    solution: "Ouvrez les fichiers en conflit, résolvez les marqueurs <<<<<<<, puis faites git add et git commit.",
    codeExample: `<<<<<<< HEAD
const apiUrl = 'https://api.prod.com';
=======
const apiUrl = 'https://api.staging.com';
>>>>>>> feature-branch

# Git ne sait pas quelle version garder`,
    fixExample: `# 1. Résoudre manuellement les conflits dans le fichier
const apiUrl = 'https://api.prod.com'; # Choisir la bonne version

# 2. Marquer comme résolu
git add src/config.ts

# 3. Finaliser le merge
git commit -m "fix: resolve merge conflict in config"

# Astuce: utiliser un outil de merge
git mergetool`,
    tags: ["merge", "conflict", "branches"]
  },
  {
    id: "git-detached-head",
    name: "Detached HEAD",
    message: "You are in 'detached HEAD' state",
    cause: "Checkout d'un commit spécifique ou d'un tag au lieu d'une branche.",
    solution: "Créez une nouvelle branche depuis cet état, ou revenez sur une branche existante.",
    codeExample: `# Se retrouver en detached HEAD
git checkout abc1234
# ou
git checkout v1.0.0

# Les commits faits ici ne seront sur aucune branche!`,
    fixExample: `# Solution 1: Créer une branche depuis l'état actuel
git checkout -b my-new-branch

# Solution 2: Revenir sur une branche existante
git checkout main

# Solution 3: Sauvegarder le travail si déjà commité
git checkout -b rescue-branch
git checkout main
git merge rescue-branch`,
    tags: ["head", "checkout", "branches"]
  },
  {
    id: "git-push-rejected",
    name: "Push Rejected",
    message: "error: failed to push some refs to 'origin'",
    cause: "Le remote contient des commits que vous n'avez pas en local (votre branche est en retard).",
    solution: "Faites git pull (ou git pull --rebase) avant de push.",
    codeExample: `git push origin main
# ! [rejected] main -> main (non-fast-forward)
# error: failed to push some refs

# Quelqu'un a pushé des commits pendant que vous travailliez`,
    fixExample: `# Solution 1: Pull puis push
git pull origin main
git push origin main

# Solution 2: Pull avec rebase (historique plus propre)
git pull --rebase origin main
git push origin main

# Solution 3: Force push (DANGER - écrase le remote)
git push --force-with-lease origin main
# --force-with-lease est plus sûr que --force`,
    tags: ["push", "remote", "rejected"]
  },
  {
    id: "git-uncommitted-changes",
    name: "Uncommitted Changes",
    message: "error: Your local changes to the following files would be overwritten",
    cause: "Vous avez des modifications non commitées qui entreraient en conflit avec l'opération demandée.",
    solution: "Commitez, stashez ou annulez vos modifications avant l'opération.",
    codeExample: `# Modifier un fichier puis essayer de changer de branche
echo "change" >> file.txt
git checkout other-branch
# error: Your local changes would be overwritten`,
    fixExample: `# Solution 1: Stash (sauvegarder temporairement)
git stash
git checkout other-branch
git stash pop  # Récupérer les modifications

# Solution 2: Commit
git add -A
git commit -m "wip: save progress"
git checkout other-branch

# Solution 3: Annuler les modifications
git checkout -- file.txt
# ou tout annuler
git checkout -- .`,
    tags: ["stash", "checkout", "uncommitted"]
  },
  {
    id: "git-rebase-conflict",
    name: "Rebase Conflict",
    message: "CONFLICT: Could not apply <commit>",
    cause: "Pendant un rebase, un commit entre en conflit avec la branche cible.",
    solution: "Résolvez le conflit, puis continuez le rebase avec --continue.",
    codeExample: `git rebase main
# CONFLICT (content): Merge conflict in src/index.ts
# error: could not apply abc1234... feat: add feature
# Resolve all conflicts manually, then run git rebase --continue`,
    fixExample: `# 1. Résoudre les conflits dans les fichiers marqués
# 2. Ajouter les fichiers résolus
git add src/index.ts

# 3. Continuer le rebase
git rebase --continue

# Ou annuler le rebase
git rebase --abort

# Astuce: rebase interactif pour squash/edit
git rebase -i HEAD~3`,
    tags: ["rebase", "conflict", "interactive"]
  },
  {
    id: "git-fatal-not-repo",
    name: "Not a git repository",
    message: "fatal: not a git repository (or any of the parent directories): .git",
    cause: "La commande git est exécutée dans un dossier qui n'est pas un dépôt Git.",
    solution: "Naviguez dans le bon dossier ou initialisez un nouveau dépôt.",
    codeExample: `cd /some/random/folder
git status
# fatal: not a git repository`,
    fixExample: `# Solution 1: Naviguer dans le bon dossier
cd ~/projects/my-app
git status

# Solution 2: Initialiser un nouveau dépôt
git init
git remote add origin https://github.com/user/repo.git

# Solution 3: Cloner un dépôt existant
git clone https://github.com/user/repo.git
cd repo`,
    tags: ["init", "repository", "fatal"]
  },
  {
    id: "git-reset-undo",
    name: "Undo commits",
    message: "Comment annuler un ou plusieurs commits ?",
    cause: "Besoin de revenir en arrière après un ou plusieurs commits (erreur, mauvaise branche, etc.).",
    solution: "Utilisez git reset (local) ou git revert (remote/partagé) selon le contexte.",
    codeExample: `# Oups, j'ai commité sur main au lieu d'une feature branch
git log --oneline
# abc1234 feat: wrong commit
# def5678 previous good commit`,
    fixExample: `# Annuler le dernier commit en gardant les fichiers
git reset --soft HEAD~1

# Annuler le dernier commit et les modifications
git reset --hard HEAD~1

# Annuler un commit publié (crée un nouveau commit inverse)
git revert abc1234

# Sauver le travail sur la bonne branche
git reset --soft HEAD~1
git stash
git checkout feature-branch
git stash pop
git commit -m "feat: correct branch"`,
    tags: ["reset", "revert", "undo"]
  },
  {
    id: "git-large-file",
    name: "Large File Error",
    message: "remote: error: File X is 120 MB; this exceeds GitHub's file size limit of 100 MB",
    cause: "Un fichier dépasse la limite de taille de GitHub (100 MB).",
    solution: "Supprimez le fichier de l'historique avec git filter-branch ou BFG, ou utilisez Git LFS.",
    codeExample: `git push origin main
# remote: error: File data/huge-dataset.csv is 120 MB
# this exceeds GitHub's file size limit of 100 MB`,
    fixExample: `# Solution 1: Git LFS pour les gros fichiers
git lfs install
git lfs track "*.csv"
git add .gitattributes
git add data/huge-dataset.csv
git commit -m "track large files with LFS"

# Solution 2: Supprimer de l'historique avec BFG
# Installer BFG: brew install bfg
bfg --strip-blobs-bigger-than 100M
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Solution 3: Ajouter au .gitignore
echo "data/*.csv" >> .gitignore
git rm --cached data/huge-dataset.csv`,
    tags: ["lfs", "large-file", "github"]
  },
];

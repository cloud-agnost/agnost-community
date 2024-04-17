const express = require('express');
const { Octokit } = require('@octokit/core');

const router = express.Router();

async function getGithubBranches(gitPat, repoName) {
  const octokit = new Octokit({ auth: gitPat });
  const owner = repoName.split('/')[0];
  const repo = repoName.split('/')[1];
  
  try {
    let allBranches = [];
    let page = 1;
    let perPage = 100;

    while (true) {
        const response = await octokit.request('GET /repos/' + owner + '/' + repo + '/branches', {
            owner: owner,
            repo: repo,
            page: page,
            per_page: perPage
        });

        const branchNames = response.data.map(branch => branch.name);
        allBranches = allBranches.concat(branchNames);

        if (response.data.length < perPage) {
            break;
        }
        page++;
    }
    return allBranches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

async function getGitlabBranches(gitPat, projectName) {
  const gitlabApiBaseUrl = 'https://gitlab.com/api/v4'

  try {
    // Step 1: Get User ID
    const responseUser = await fetch(`${gitlabApiBaseUrl}/user`, { headers: { 'PRIVATE-TOKEN': gitPat }});
    if (!responseUser.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await responseUser.json();
    const userId = user.id;

    // Step 2: Get All Project IDs Owned by User
    const responseProject = await fetch(`${gitlabApiBaseUrl}/users/${userId}/projects`, { headers: { 'PRIVATE-TOKEN': gitPat } });
    if (!responseProject.ok) {
      throw new Error('Failed to fetch project data');
    }
    const projects = await responseProject.json();

    // Step 3: Find Specific Project ID
    const project = projects.find(project => project.path_with_namespace === projectName);
    if (!project) {
      console.error(`Project '${projectName}' not found.`);
      return;
    }
    const projectId = project.id;

    // Step 4: Get All Project IDs Owned by User
    const responseBranches = await fetch(`${gitlabApiBaseUrl}/projects/${projectId}/repository/branches`, { headers: { 'PRIVATE-TOKEN': gitPat } });
    if (!responseBranches.ok) {
      throw new Error('Failed to fetch branch info');
    }

    const branches = await responseBranches.json();
    return branches.map(branch => branch.name);
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

router.get('/listGitBranches', async (req, res) => {
  const { gitRepoType, gitRepoName, gitPat } = req.query;

  try {
    switch(gitRepoType) {
      case('github'):
        await getGithubBranches(gitPat, gitRepoName)
          .then(branches => {
            res.json({ "branchList": branches });
          });
        break;
      case('gitlab'):
        await getGitlabBranches(gitPat, gitRepoName)
          .then(branches => {
            res.json({ "branchList": branches });
          });
        break;
    }
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;

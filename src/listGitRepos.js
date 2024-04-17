const express = require('express');
const { Octokit } = require('@octokit/core');

const router = express.Router();

async function getGithubRepos(gitPat) {
  const octokit = new Octokit({ auth: gitPat });
  
  try {
    let allRepos = [];
    let page = 1;
    let perPage = 100;

    while (true) {
        const response = await octokit.request("GET /user/repos", {
            page: page,
            per_page: perPage
        });

        const repoNames = response.data.map(repo => repo.full_name);
        allRepos = allRepos.concat(repoNames);

        if (response.data.length < perPage) {
            break;
        }
        page++;
    }
    return allRepos;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

async function getGitlabRepos(gitPat) {
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
    return projects.map(project => project.path_with_namespace);
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

router.get('/listGitRepos', async (req, res) => {
  const { gitRepoType, gitPat } = req.query;

  try {
    switch(gitRepoType) {
      case('github'):
        await getGithubRepos(gitPat)
          .then(repos => {
            res.json({ "repoList": repos });
          });
        break;
      case('gitlab'):
        await getGitlabRepos(gitPat)
          .then(repos => {
            res.json({ "repoList": repos });
          });
        break;
    }
  } catch (err) {
    res.status(500).json(JSON.parse(err.message));
  }
});

module.exports = router;

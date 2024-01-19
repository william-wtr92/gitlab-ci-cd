# ⚙️ CI-CD Project - M1 Dev B

## 🐳 Exercise 0 - Before the CI: Dockerized web static app

##### 🚀 To start the container, you need to follow these instructions.

- Clone the projet with this command : `git clone git@gitlab.com:william-wtr92/m1-ci-cd.git`
- Go at the root of the cloned project : `cd m1-ci-cd/`
- Build the image with : `docker build -t m1-ci-cd .`<br/>

##### 🌐 The different `docker run` commands depend on the environment you want to be in

- To launch the **STAGING** container so that you're able to modify the content thanks to the docker volume, run this command:
  `docker run -d --name m1-ci-cd-staging -P -v $(pwd)/data/modif-data:/app/data/modif-data -e ENV=staging m1-ci-cd`

- To launch the **PRODUCTION** container with the embedded part directly in the image, run this command :
  `docker run -d --name m1-ci-cd-prod -P -e ENV=production m1-ci-cd`

- Optional: To override the embedded `emb-data` in production with a volume:
  `docker run -d --name m1-ci-cd-prod-over -P -v $(pwd)/data/emb-data:/app/data/emb-data -e ENV=production-over m1-ci-cd` <br/>

## ✏️ Exercise 1: Continuous Integration and Deployment with Auto DevOps

#### 🔨 Introducing and configuring Auto DevOps

- To activate Auto DevOps on the project, go to `CI/CD Settings > Auto DevOps` and expand the feature.<br/><br/>

- Once inside, tick the Default to Auto DevOps pipeline box and for **the purposes of the exercise** it was preferable to choose the **3rd option ( Automatic deployment to staging, manual deployment to production )** as we would be dealing with deployment in staging and production.

![Capture d’écran 2023-12-03 à 19.39.11](https://i.imgur.com/dfKOMYG.png)

- Once this was done, you were given a default configuration, which is this: [Link to config](https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/ci/templates/Auto-DevOps.gitlab-ci.yml), this configuration automatically creates jobs based on the content of your project, so you don't need a **.gitlab-ci.yml file to have a CI**.<br/><br/>

- Below is a screen of my pipeline for adding Auto DevOps **without a .gitlab-ci.yml file.**
  **(The failed jobs are due to the gitlab-runners because I'm using my own, I put their configurations right after)**<br/><br/>
  - [Link to the target pipeline](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1093666231):
    ![Capture d’écran 2023-12-03 à 19.55.21](https://i.imgur.com/cUWp8zv.png)

#### 📝 Custom and configure Runners

- When a pipeline is launched, it uses Runners, either the default **Sharred Runners** or, if we wish, our own **Project Runners**, which is preferable if we want total control over our continuous integration environment.<br/><br/>

- For this exercise I needed 2 custom runners, so I went to **CI/CD Settings > Runners** , and clicked on **New Project Runner**. I also deactivated the Sharreds to make sure they weren't used.<br/><br/>

  - I have a runner that allows me to run all the Auto DevOps jobs and also some custom ones, with a basic configuration, I'm sharing the **config.toml file here**:

    ```yml
      concurrent = 3 # Sets the maximum number of jobs the runner can execute simultaneously. Here, up to 3 jobs can be run at the same time.
      check_interval = 0
      shutdown_timeout = 0

      [session_server]
        session_timeout = 1800

      [[runners]]
        name = "custom-runner1"
        url = "https://gitlab.com"
        id = 30009828
        token = "<mytoken>"
        token_obtained_at = 2023-12-03T07:01:44Z
        token_expires_at = 0001-01-01T00:00:00Z
        executor = "docker"
        [runners.docker]
          tls_verify = false
          image = "docker:20.10.12"
          privileged = true # Allows the Docker container to run in privileged mode, giving the container almost the same access as the host machine.
          disable_entrypoint_overwrite = false
          oom_kill_disable = false
          disable_cache = false
          volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]  # Mounts volumes inside the Docker container. Here, the Docker socket is shared to allow the container to communicate with the Docker daemon, and a cache volume is also mounted.
          pull_policy = ["if-not-present"] # Defines the Docker image pull policy. Here, the image is pulled only if it's not already present locally.
          shm_size = 0
          network_mtu = 0
    ```

  - I have a second runner just for the code_quality job, which requires a certain architecture and whose configuration is shared at [code_quality](https://docs.gitlab.com/ee/ci/testing/code_quality.html):

    ```yml
      concurrent = 1
      check_interval = 0
      shutdown_timeout = 0

      [session_server]
        session_timeout = 1800

      [[runners]]
        name = "cq-sans-dind"
        url = "<https://gitlab.com>"
        id = 30023772
        token = "<mytoken>"
        token_obtained_at = 2023-12-03T16:31:54Z
        token_expires_at = 0001-01-01T00:00:00Z
        executor = "docker"
        builds_dir = "/tmp/builds" # Specifies the directory inside the container where the builds will be executed.
        [runners.cache]
          MaxUploadedArchiveSize = 0
          [runners.cache.s3]
          [runners.cache.gcs]
        [runners.docker]
          tls_verify = false
          image = "docker:latest"
          privileged = true
          disable_entrypoint_overwrite = false
          oom_kill_disable = false
          disable_cache = false
          volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock", "/tmp/builds:/tmp/builds"] # Build directory for storing build files.
          pull_policy = "if-not-present"
          shm_size = 0
          network_mtu = 0
    ```

- Once my runners are in place, I have a pipeline running and I decide to **customize it** to integrate the **staging deployment**, knowing that the **build job** for my image is done by Auto DevOps.

#### 🔬 Creation and customization of the .gitlab-ci.yml file

- With Auto DevOps it is possible to create a **.gitlab-ci.yml** file in order to add, complete or overwrite certain functions.<br/><br/>

- Once I saw that my pipeline was running with my own runners I decided to add the deployment job to the **staging environment**:

  - Here is the **.yml code**:

    ```yml
    include:
      - template: Auto-DevOps.gitlab-ci.yml # import of the Auto DevOps model

      # I do not need to declare the internships in this pipeline because they are declared in the Auto DevOps template imported at the top of it

    variables:
      TEST_DISABLED: "1" # deletion of the Auto DevOps 'Test' job because it is deprecated and we will make it a custom
      STAGING_CTN_NAME: m1-ci-cd-staging # variable used to remove and run the container for the STAGING environment
      STAGING_URL: <http://localhost:3001/> # variable which contains the deployment url of the website in staging
      PROD_URL: https://m1-ci-cd-william-wtr92-b23c1a4222838f3c3110a4cf3f809745294028d2.gitlab.io # variable which contains the deployment url of the website in production

    build: # I set rules for triggering the build job because it is a job that does not need to be executed when nothing has changed, it just slows down the pipeline and generates an image identical to the previous one.
      rules: # at least one of these directories or files must be modified for the job to trigger
        - changes:
            - public/**/*
            - src/**/*
            - data/**/*
            - Dockerfile
            - .dockerignore
            - package.json
      allow_failure: false # does not accept that the job fails and fails the pipeline

    semgrep-sast:
      allow_failure: false

    secret_detection:
      allow_failure: false

    nodejs-scan-sast:
      allow_failure: false

    container_scanning: # same operation as the build job
      rules:
        - changes:
            - public/**/*
            - src/**/*
            - data/**/*
            - Dockerfile
            - .dockerignore
            - package.json
      allow_failure: false

    code_quality: # Auto DevOps job, link to the doc: https://docs.gitlab.com/ee/ci/testing/code_quality.html
      stage: test
      services: # configuration specific to the doc
      allow_failure: false # fail of this job is not allowed
      tags: # code_quality needs its custom runner unlike other jobs as explained above
        - cq-sans-dind1

    deploy-staging: # custom job for staging deployment
      rules:
        - if: $CI_COMMIT_BRANCH == "develop" # the rule is there to activate the job only when the action is on the develop branch because it is the branch on which the staging version is built
      image: docker # use of the docker image so that the commands are recognized in the job instance
      stage: staging # belongs to the process staging stage of the pipeline
      before_script:
        - echo $CI_REGISTRY_PASSWORD | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin # I log in to the gitlab registry so that my job instance knows where to pull the image that was previously generated by the Auto DevOps build step
      script:
        - echo "Deploying docker image 🚀"
        - docker pull $CI_REGISTRY_IMAGE/$CI_COMMIT_REF_SLUG:latest # pull the image from my registry using the different environment variable, most of them are self-generated variables
        - docker rm -f $STAGING_CTN_NAME || true # deletion of the old docker container which runs the staging version if it exists otherwise the `|| true` is present when it does not find a container and it goes to the next step
        - docker run --name $STAGING_CTN_NAME -d -p 3001:3000 -e ENV=staging $CI_REGISTRY_IMAGE/$CI_COMMIT_REF_SLUG:latest # launch of the container its name retrieved with the variable STAGING_CTN_NAME, -d to launch it detached, -p for mapping the port to the target environment, -e to setup an environment variable in the container which will be STAGING and after we tell it the target image with which to launch the container
        - echo $CI_REGISTRY_IMAGE/$CI_COMMIT_REF_SLUG:latest
      environment: # When we go to the Operate > Environment section of the GitLab project, we have the possibility of setting up an environment, so that's what I do from my CI
        name: $CI_COMMIT_REF_NAME # environment name
        url: $STAGING_URL # url where we can visit our site in staging
      needs: # the needs instruction is used to make the job understand that it needs/depends on the other jobs mentioned in the table
        [
          "code_quality",
          "nodejs-scan-sast",
          "secret_detection",
          "semgrep-sast",
          "analyze_zap_report",
        ]
    ```

- Here is the rendering of my pipeline graphically once executed, during the example I deactivated the execution rules only on the develop branch in order to carry out my tests:<br/><br/>

  - [Link to the pipeline succeed with Build & Container Scanning](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1093697087) :
    ![Capture d’écran 2023-12-03 à 21.18.19](https://i.imgur.com/qEh9d29.png)

- The screen below shows the steps when the files targeted by the **build and container_scanning** job rules are not filled:<br/><br/>
  - [Link to the pipeline succeed without Build & Container Scanning](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1093789188)
    ![Capture d’écran 2023-12-03 à 23.49.58](https://i.imgur.com/lV06EVL.png)

#### 📜 Auto DevOps jobs explained

- In the screenshot above we have **6 jobs self-implemented** thanks to Auto DevOps:<br/><br/>
  - **build**: Allows from my **Dockerfile** to the root of the build project to optimize its image
  - **code_quality**: To analyze the quality and complexity of my source code. This helps keep the project code simple, readable, and easier to maintain.
  - **container_scanning**: In-depth analysis of the structure of the image generated by the Dockerfile in order to identify vulnerabilities or not.
  - **semgrep-sast**: Static Application Security Testing (SAST), **Job parend of nodejs-scan-sast**
  - **nodejs-scan-sast**: Child of the semgrep-sast job to check your source code specifically for javascript and compare it to known vulnerabilities, the result is downloaded in the **project artifacts in .json format**
  - **secret_detection**: Checks the secret leak in the current repository and avoids certain potential flaws, the result is uploaded to the project artifacts in .json format

## 🔌 Exercise 2: Staging and production deployment

#### 📖 Configuration of GitLab Pages for Production ENV

- For the deployment of the staging and production versions we used **GitLab Pages**, mainly referring to the documentation.

- We had to add a new job to manage the different deployments:<br/><br/>

  - [Link of GitLab Pages documentation](https://docs.gitlab.com/ee/user/project/pages/):

  ```yml
  variable:
    PROD_URL: https://m1-ci-cd-william-wtr92-b23c1a4222838f3c3110a4cf3f809745294028d2.gitlab.io # variable used in pages job in environment step to add url in

  pages: # default name of the job that allows deployment to GitLab pages
    stage: deploy # belongs to the deployment stage
    image: node:21.1.0-alpine # use node image to run the command in script step below
    script:
      - npm ci # installation of dependencies in package.json of the project
      - npm run test:e2e # run all tests (currently, this only checks if the components are correctly rendered)
      - npm run build # build of application
      - rm -rf public/* # deletion of the basic public content because it must be able to welcome with the following command the content generated from the "out/*" folder which is generated during the command above npm run build and which generates a static version of our site
      - mv out/* public # moving the content of "out/*" so what was generated in public/ folder
      - echo "Deploy to GitLab Pages in Production 🚀"
    artifacts: # creation of an artifact published on GitLab in the Build > Artifacts section which is based on the contents of the public folder/, from where the scripts above
      paths:
        - public
    cache: # caching of node_modules and .next/cache elements specific to the framework we use (see the GitLab Pages documentation relating to NextJS)
      key: ${CI_COMMIT_REF_SLUG}
      paths:
        - node_modules/
        - .next/cache/
    environment: # creating a production environment with the link pointing to the URL of the GitLab Production Pages
      name: production
      url: $PROD_URL
    rules: # definition of rules to start this jobs only on main branch
      - if: $CI_COMMIT_BRANCH == "main"
      - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      when: never
    needs: # jobs that must be validated before executing the job pages
    [
      "code_quality",
      "nodejs-scan-sast",
      "secret_detection",
      "semgrep-sast",
      "analyze_zap_report",
    ]
    tags: # custom runner used
      - node
    retry: # sometimes the npm ci command marks a proxy error and on restart it works so it is a minor problem which just requires retrying the job
      max: 2
      when:
        - runner_system_failure
        - stuck_or_timeout_failure

  ```

- Once our CI is deployed we have in the Pages part of GitLab the link which allows us to go to the deployed website:<br/><br/>

  - [Pipeline Succeed with GitLab Pages deploy](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1098057313):
    ![Capture d’écran 2023-12-07 à 19.16.30](https://i.imgur.com/UJq04km.png)<br/><br/>

  - [Link to Production GitLab Pages](https://m1-ci-cd-william-wtr92-b23c1a4222838f3c3110a4cf3f809745294028d2.gitlab.io)
    ![Capture d’écran 2023-12-07 à 19.17.20](https://i.imgur.com/ByK8LF9.png)
    ![Capture d’écran 2023-12-07 à 19.18.51](https://i.imgur.com/4WOqU0n.jpg)

#### 🔎 Configuration specific to NextJS for deployment on GitLab Pages

- Referring to this documentation [Custom settings for NextJS](https://docs.gitlab.com/ee/user/project/pages/public_folder.html) , we could see that it was necessary to change settings in the **NextJs configuration folder** so that it generates a compiled and possible static exported version of the site.<br/><br/>

- Configutation of our **next.config.js** file:

  ```yml
    /** @type {import('next').NextConfig} */

    const nextConfig = {
      output: "export", # this parameter allows the execution of npm run build to generate an out/ folder containing the static version of the site
      reactStrictMode: true, # default params
      images: {
        unoptimized: true, # default params
      },
      assetPrefix: "./", # the assetPrefix setup allows you to give a path to the assets of the static version of the website
    }

    module.exports = nextConfig
  ```

#### 🖇️ Choice of NextJS & Own Runners: Why ?

- We made the technical choice to use **NextJS** for the simplicity that the framework provides and its **compatibility with GitLab in the sense that there is written documentation on its setup for GitLab Pages for example**, its possibility of building its static content and the 'export which helped us in the creation of our CI. <br/><br/>

- Secondly, we chose to have our own runner because **it is important to be able to control our entire environment**, excluding the fact that we only have 400 minutes offered with the Sharred Runner, **this provides a real control over it**.

## 💣 Exercise 3: Vulnerabilities?

- To perform vulnerability scans on the project, we had to use **OWASP ZAP**, so that the CI would fail if the scan returned any anomalies or security issues.<br/><br/>

#### 📝 Explanation of jobs created for vulnerability scanning

- To do this, we have created **2 separate jobs** in the CI:

  - One that will perform the **scan and publish** the result in HTML format in the project's atifacts:

    ```yml
    zap_scan:
      stage: test # stage to which the job belongs
      image: owasp/zap2docker-stable # image owasp scan qui permet de lancer le scan et les commandes plus bas
      script:
        - cd /zap/wrk # move to the correct working directory /zap/wrk
        - zap-baseline.py -t $PROD_URL -c gen.conf -r zap_report.html # we execute the command line to launch a python script that will run the scan, we must provide it with the following parameters: the URL on which it will run the scan, the configuration of the test steps in gen.conf (a file that has been sotcked locally and mapped to a volume on the runner can be read and shared when the job is run), and finally the name of the html file that will be generated and will contain the scan report.
      after_script:
        - echo "Copy report file to the artifact path..."
        - cp /zap/wrk/zap_report.html . # we copy the content of the report generated in html so that the artifact does not generate an error: "WARN : no *.html file in this directory".
      artifacts:
        when: always
        paths:
          - zap_report.html # creation of artifact in the gitlab project containing the html report
        expire_in: 1 week # rule allowing the file to be kept for 1 week in the project artifacts
      rules: # rule requesting activation of this job than main and develop because it is only on these 2 branches that deployment jobs are executed and that we need to scan.
        - if: $CI_COMMIT_BRANCH == "develop"
        - if: $CI_COMMIT_BRANCH == "main"
      allow_failure: false # not allowed to fail
      tags:
        - owasp # runner used to run this job
    ```

  - Secondly, we have a job that analyses the generated artifacts and, using a js script, **causes the CI to fail if there are any anomalies in the analysis of the html report:**

    ```yml
    zap_scan:
      stage: test # stage to which the job belongs
      image: owasp/zap2docker-stable # image owasp scan qui permet de lancer le scan et les commandes plus bas
      script:
        - cd /zap/wrk # move to the correct working directory /zap/wrk
        - zap-baseline.py -t $PROD_URL -c gen.conf -r zap_report.html # we execute the command line to launch a python script that will run the scan, we must provide it with the following parameters: the URL on which it will run the scan, the configuration of the test steps in gen.conf (a file that has been sotcked locally and mapped to a volume on the runner can be read and shared when the job is run), and finally the name of the html file that will be generated and will contain the scan report.
      after_script:
        - echo "Copy report file to the artifact path..."
        - cp /zap/wrk/zap_report.html . # we copy the content of the report generated in html so that the artifact does not generate an error: "WARN : no *.html file in this directory".
      artifacts:
        when: always
        paths:
          - zap_report.html # creation of an artifact in the gitlab project containing the HTML report
        expire_in: 1 week # rule allowing the file to be kept for 1 week in the project artifacts
      rules: # rule requesting activation of this job than main and develop because it is only on these 2 branches that deployment jobs are executed and that we need to scan.
        - if: $CI_COMMIT_BRANCH == "develop"
        - if: $CI_COMMIT_BRANCH == "main"
      allow_failure: false # not allowed to fail
      tags:
        - owasp # runner used to run this job
    ```

  - And another job that analyzes the generated artifacts and, by using a JS script, can cause the CI to fail if there are any anomalies in the analysis of the HTML report:

    ```yml
    analyze_zap_report:
      stage: review # stage to which the job belongs
      image: node:latest # node image is used to run npm command below
      script:
        - npm install jsdom # installation of jsdom dependencies to launch the script below
        - node analyzeReport.mjs # run the script used to retrieve and check the value of an element in the html report
      artifacts:
        when: on_failure # when the job analyze fails, I republish an artifact containing the HTML report on which it failed
        paths:
          - zap_report.html
      rules:
        - if: $CI_COMMIT_BRANCH == "develop"
        - if: $CI_COMMIT_BRANCH == "main"
      needs:
        - job: zap_scan # dependence of the zap scan job
          artifacts: true # requires the publication of artefacts by the latter
      allow_failure: false # not allowed to fail
    ```

    - Here's the detailed and explained script called in the CI:

    ```js
    import fs from "fs" // File system module for file operations
    import { JSDOM } from "jsdom" // JSDOM module to work with the DOM of HTML documents

    // Read the content of the 'zap_report.html' file as a string
    const html = fs.readFileSync("zap_report.html", "utf8")

    // Parse the HTML string into a DOM object
    const dom = new JSDOM(html)

    // Access the document object from the DOM
    const document = dom.window.document

    // Find the first DOM element that matches the CSS selector 'td.risk-3 + td div'
    // This targets a div inside a td, which is immediately preceded by a td with class 'risk-3'
    const highRiskElement = document.querySelector("td.risk-3 + td div")

    // Extract the text content of the found element, convert it to an integer
    // If the element doesn't exist, set the count to 0
    const highRiskCount = highRiskElement
      ? parseInt(highRiskElement.textContent, 10)
      : 0

    // Check if there are any high-risk issues
    if (highRiskCount > 0) {
      // If there are high-risk issues, log an error message with the count
      console.error(`Found high risk issues: ${highRiskCount}`)

      // Exit the process with an error code (1)
      process.exit(1)
    } else {
      // If there are no high-risk issues, log a success message
      console.log("No high risk issues found.")

      // Exit the process normally (0)
      process.exit(0)
    }
    ```

  - Finally, I'm going to show you the configuration of my config.toml file **for running zap_scan because a particular volume is expected:**

    ```yml
      [[runners]]
        name = "owasp"
        url = "<https://gitlab.com>"
        id = 30268258
        token = "<mytoken>"
        token_obtained_at = 2023-12-08T18:11:26Z
        token_expires_at = 0001-01-01T00:00:00Z
        executor = "docker"
        [runners.cache]
          ...
        [runners.docker]
          ...
          volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock","/tmp/builds:/zap/wrk"] # mapping of a volume pointing from /tmp/builds to the directory requested by the scan script, which is /zap/wrk
          ...
    ```

#### 🔎 The different results are analyzed

- When the job succeeds, **the dependencies are used to launch the staging and production deployment**. Here is a pipeline to the merge of my branch to develop to analyse the triggering of the job:

  - [Link of pipline succeed on staging env](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1101257678)
    ![Capture d’écran 2023-12-09 à 11.20.12](https://i.imgur.com/wES75nY.png)<br/><br/>
  - [Link of pipline succeed on production env](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1101264873)
    ![Capture d’écran 2023-12-09 à 11.41.42](https://i.imgur.com/dAg3Ewu.png)<br/><br/>

- In the piplines below I'm going to put the reaction of the pipeline when **the scan fails and it finds a vulnerability:**
  - [Link of pipline fail on staging env](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1101271852)
    ![Capture d’écran 2023-12-09 à 12.05.00](https://i.imgur.com/uPKREVr.png)<br/><br/>
  - [Link of pipeline fail on production env](https://gitlab.com/william-wtr92/m1-ci-cd/-/pipelines/1101285652)
    ![Capture d’écran 2023-12-10 à 17.45.02](https://i.imgur.com/GhU0nDe.png)
- We can see that when the scan fails it blocks the following stages of the pipeline and therefore the deployment, **the behavior is the same for the production deployment**.

## Additionnal content : Playwright e2e tests for components

This repository contains automated tests using Playwright to check if our components are rendered correctly or not.

You can find each test right here in the `/e2e` folder.

If you reached this step, we're assuming you already have the project cloned into your PC.

First, you must have the app running : `npm run dev`.

Now you can run the tests :

- **individually** by running this command : `npx playwright test fileName.spec.js`, replacing `fileName` by the name of a file in `/e2e` folder,
- **globally** by running this command: `npm run test:e2e`, it will run the tests for **all** the components (for all the tests in the `/e2e` folder).

### Playwright tests in CI

As tests can be runned manually, they can be runned automatically too, like inside the CI, here's the job used to run our e2e tests inside our `.gitlab-ci.yml` file :

```yml
e2e-tests:
  stage: test # Stage to which the job belongs
  image: mcr.microsoft.com/playwright:v1.40.0-jammy # Docker image to use for the job (Playwright)
  script:
    - npm install # Installing project dependencies
    - npm run test:e2e # Running end-to-end tests
  rules:
    - if: '$CI_PIPELINE_SOURCE != "merge_request_event"' # Condition to execute the job only when the pipeline source is not a merge request event
      when: always # Job execution condition when the rule is met
  allow_failure: false # Whether the job is allowed to fail without impacting the pipeline
```

This job won't be runned on merge requests, however it will be runned in any other case

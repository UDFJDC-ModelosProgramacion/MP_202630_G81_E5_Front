pipeline {
   agent any
   environment {
      SONARQUBE_URL = 'http://sonarqube:9000'
      SONAR_TOKEN = credentials('sonar-token')
   }
   stages {
      stage('Checkout') {
         steps {
            checkout scm
         }
      }
      stage('Build') {
         steps {
            sh '''
               node -v
               npm -v
               npm ci
               npm run lint
               npm run build
            '''
         }
      }
      stage('Testing') {
         steps {
            sh 'npm run test:coverage'
         }
      }
      stage('Static Analysis') {
         steps {
            sh '''
               npm run sonar -- \
                  -Dsonar.host.url=${SONARQUBE_URL} \
                  -Dsonar.token=${SONAR_TOKEN} \
                  -Dsonar.qualitygate.wait=true
            '''
         }
      }
   }
   post {
      always {
         deleteDir()
      }
   }
}
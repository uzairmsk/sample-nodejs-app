pipeline {
    agent any
    
    environment {
      
        PROJECT_ID="stellar-orb-419517"
        REGISTRY_LOC="us-central1-docker.pkg.dev"
        REPO_NAME="sample-nodejs-app"
        IMAGE_NAME="nodejs-app"
        IMAGE_TAG="latest"
        BRANCH_NAME="main"
        
        GKE_CLUSTER_NAME="nodejs-cluster"
        GKE_CLUSTER_ZONE="us-central1-a"
    }
    stages{
        stage('Authentication') {
            steps {
                sh'''
                    gcloud auth configure-docker $REGISTRY_LOC
                    gcloud container clusters get-credentials $GKE_CLUSTER_NAME --zone $GKE_CLUSTER_ZONE --project $PROJECT_ID
       
                '''
            }
        }
        stage('Cloning') {
            steps {
                sh '''
                  rm -rf $REPO_NAME
                  git clone https://github.com/uzairmsk/sample-nodejs-app.git
                  
                '''   
            }
        }
        stage('Building Image') {
            steps {
                sh '''
                  cd $REPO_NAME
                  kubectl apply -f mongo-deployment.yaml
                  MONGO_IP=$(kubectl get svc --field-selector metadata.name="mongodb" -o json|jq '.items[0].status.loadBalancer.ingress[0].ip')
                  
                  while true;
                  do
                      if [ "$MONGO_IP" == null ]
                      then 
                        sleep 2;
                        MONGO_IP=$(kubectl get svc --field-selector metadata.name="mongodb" -o json|jq '.items[0].status.loadBalancer.ingress[0].ip');
                        echo $MONGO_IP;
                      else
                        break
                      fi
                  done
                  
                  git checkout $BRANCH_NAME 
                  docker build -t $IMAGE_NAME --build-arg="MONGO_URI=$MONGO_IP" .
                  
                '''   
            }
        }
        
        stage('Trivy Scan'){
            steps{
                 sh '''
                 trivy image --severity CRITICAL $IMAGE_NAME
                 '''
            }
        }
        
        stage('Pushing image to Artifact registry') {
            steps {
                sh '''
                    docker tag $IMAGE_NAME $REGISTRY_LOC/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$IMAGE_TAG
                    docker push $REGISTRY_LOC/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$IMAGE_TAG
                '''    
            }
        }
        
        
        stage('Deploying to gke Cluster') {
            steps{
                sh '''
                  cd $REPO_NAME
                  ARTIFACT=$(gcloud artifacts docker images list us-central1-docker.pkg.dev/stellar-orb-419517/sample-nodejs-app --filter="package=us-central1-docker.pkg.dev/stellar-orb-419517/sample-nodejs-app/nodejs-app" --sort-by="~UPDATE_TIME" --limit=1 --format="value(format("{0}@{1}",package,version))")
                  sed -i "s|replaced_with_updated_image_from_jenkins|$ARTIFACT|g"  Deployment.yaml
                  kubectl apply -f Deployment.yaml
                  kubectl apply -f Service.yaml
                '''   
            }
        }
        
    }
        
    //post stage will execute at the end of script even if any of the above stage fails
    post {
      always {
            sh '''
              rm -rf $REPO_NAME
              docker system prune -a -f
              docker rm -vf $(docker ps -aq)              
            '''
             
        }
        
    }
    
   
}   

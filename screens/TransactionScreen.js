import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,TextInput , Image} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as firebase from "firebase";
import db from "../config.js"

export default class TransactionScreen extends React.Component{
   constructor(){
       super();
       
       this.state={
           cameraPermissions:null,
           scanned:false,
           scannedBookId:"",
           buttonState:"normal",
           scannedStudentId:"",
           transactionMessage: ""
       }

   }
        handleTransaction= async ()=>{
            var message = null;

            db.collection("books").doc(this.state.scannedBookId).get()
            .then((doc)=>{
                var book = doc.data() //transfers info from firestore to variable book
                if (book.bookAvailability){
                    this.initiateBookIssue()
                    message = "Book Issued";
                }else{
                    this.initiateBookReturn()
                    message = "Book Returned";
                }
            });

            this.setState({transactionMessage:message})
        }

        initiateBookIssue = async ()=>{
            //Adding a new transaction
            db.collection("transactions").add({
                studentId:this.state.scannedStudentId,
                bookId:this.state.scannedBookId,
                date:firebase.firestore.Timestamp.now().toDate(),
                transactionType:"issue"
            })

            //Changing book Availability status to false
                db.collection("books").doc(this.state.scannedBookId).update({
                    bookAvailability:false,
                })
                
                //Increasing the number of books issued by this student
                db.collection("students").doc(this.state.scannedStudentId).update({
                    numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
                })

                this.setState({
                    scannedStudentId:"",
                    scannedBookId:""
                })
        }

        initiateBookReturn = async ()=>{
            //Adding a new transaction
            db.collection("transactions").add({
                studentId:this.state.scannedStudentId,
                bookId:this.state.scannedBookId,
                date:firebase.firestore.Timestamp.now().toDate(),
                transactionType:"return"
            })

            //Changing book Availability status to true
                db.collection("books").doc(this.state.scannedBookId).update({
                    bookAvailability:true,
                })
                
                //Decreasing the number of books issued by this student
                db.collection("students").doc(this.state.scannedStudentId).update({
                    numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
                })

                this.setState({
                    scannedStudentId:"",
                    scannedBookId:""
                })
        }
   
        getCameraPermissions = async (id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
   this.setState({
       cameraPermissions:status==="granted",
       buttonState:id,
       scanned:false
   })

   }
handleBarcodeScan = async ({type,data})=>{

    if(this.state.buttonState === "bookId"){
        this.setState({
            scanned:true,
            scannedBookId:data,
            buttonState:"normal"
        })
    
    }else if(this.state.buttonState==="studentId"){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:"normal"
        })
    }

}
    

render(){
    if(this.state.buttonState!=="normal" && this.state.cameraPermissions){
        return(
            <BarCodeScanner style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={this.state.scanned ? undefined : this.handleBarcodeScan}/>
        )
    }else if (this.state.buttonState==="normal"){
        return(
            <View style = {styles.container}>    

{                <View><Image source={require("../assets/booklogo.jpg")} style={{width:200,height:200}}/>
                <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
                </View>
 }
                <View style = {styles.inputView}>
                    <TextInput style={styles.inputBox } placeholder="book id" value ={this.state.scannedBookId}/>
                   
                    <TouchableOpacity style={styles.scanButton} onPress={()=>{
                        this.getCameraPermissions("bookId")
                    }}>
                        <Text style={styles.buttonText}>
                            scan
                        </Text>
                    
                    </TouchableOpacity>
                
                </View>

                <View>
                    <TextInput style={styles.inputBox } placeholder="student id" value={this.state.scannedStudentId}/>
                   
                    <TouchableOpacity style={styles.scanButton} onPress={()=>{
                        this.getCameraPermissions("studentId")
                        }}>
                        <Text style={styles.buttonText}>
                            scan
                        </Text>
                    
                    </TouchableOpacity>
                
                </View>
            <TouchableOpacity style = {styles.submitButton} onPress={()=>{
              await this.handleTransaction()
            }}>
                    <Text style = {styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        );
    }
        
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },

    displayText:{
        fontSize:15,
        textDecorationLine:"underline"
    },

    scanButton:{
        backgroundColor:'blue',
        padding:10,
        margin:10
    },

    buttonText:{
        fontSize:20
    },
    inputBox: {
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
    },
    inputView:{
        flexDirection: 'row',
        margin: 20
    },
    submitButton:{
        backgroundColor: '#FBC02D',
        width: 100,
        height:50
      },
      submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight:"bold",
        color: 'white'
      }
})

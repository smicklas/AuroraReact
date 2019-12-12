import React, {Component} from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import './App.less';

var apiKey = ""; //insert Darkspy API here TODO - add secrets file 
var url = 'https://api.forecast.io/forecast/';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          fetching: false,
          visibility: null,
          latitude: null,
          longitude: null,
          response: '',
          loading : true,
          aurora_activity : null, //Plain text 
          aurora_opacity: null, //Value to scale aurora animation opacity
          cloud_coverage: null
        };
        //this.parseAurora = this.parseAurora.bind(this);
    }

   
//Get coordinates from user, call weather
getCoordinatesAndWeather() {
    if (window.navigator.geolocation) { // if geolocation is supported
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({ latitude: position.coords.latitude})
          this.setState({ longitude: position.coords.longitude})
          this.callWeatherApi(this.state.latitude, this.state.longitude)
          .then(res => this.setState({ response: res.express }))
            .catch(err => console.log(err));
            this.parseAurora(this.state.latitude, this.state.longitude);
            this.parseCloudCover();
        },
        (error) => {
          this.setState({
            error: error.message,
          });
        }
      );
    } 
  }

//Get weather data from coordinates
callWeatherApi = async(latitude, longitude) => {
    //let response = await fetch(url + apiKey + "/" + latitude + "," + longitude);
    //console.log(url + apiKey + "/" + latitude + "," + longitude);

    //Testing data, this was easier than setting up API proxy server but does not allow for complete testing. 
    var body = require('../test/test_data.json');
    //console.log(response);
    // let body = await response.json();

    // if (body.cod == 404) {
    //     console.log("error")
    //     throw Error(body.message);
    //   } else {
         this.setState({
           errorText: "",
           data: body,
           loading: false
         })
         return body;
    //   }
};

//Scrap for NOAA aurora data, find KP index value for latitude and longitude received 
//This is subject to breakage if the format of the data changes...
//TODO: proper error handling 
//TODO: add style changes based on aurora visibility 
parseAurora = async(latitude, longitude) =>{
  let response;
  var aurora_string = "";
  try{
  //fetch('https://services.swpc.noaa.gov/text/aurora-nowcast-map.txt')
  fetch('test/aurora-nowcast-map.txt') //Read from local test file so I can stop hitting NOAA with every reload 
  .then(res => res.blob()) // Gets the response and returns it as a blob
  .then(blob => {
    var reader = new FileReader();
    //Set scope for onload
    const scope = this;
    reader.onload = function(e){  
      var raw_file = e.target.result;
      var i = 0;
      var new_lines = 0
      var kp_start = 0;
      while(i < filesize){
        if(raw_file.charCodeAt(i) == 10){
          new_lines++;
        }
        if(new_lines == 17){ //# of lines before actual map starts 
          kp_start = i+1; 
          break;
        }
        i++;
      }
      var final_map =  raw_file.substring(kp_start, filesize); //Trim off beginning section of NOAA file
      final_map = final_map.match(/\d+/g).map(Number);
      var x = 0;
      if(longitude <= 0){
        x = longitude + 360;
      }else{
        x = longitude;
      }
      //Have to scale lat/long values to match scale of map of NOAA 
      x = x / 0.3284615; 
      var y = (latitude + 90) / 0.3515625; 
      var final_pos = Math.round((y * 1024) + x);
      var aurora_percentage = final_map[final_pos]; 
      switch(true){
        case (aurora_percentage < 25):
          aurora_string = "Little to no probability of visible aurora.";
          break;
        case (aurora_percentage < 50):
          aurora_string = "Low probability of visible aurora."
          break;
        case(aurora_percentage < 75):
          aurora_string = "Medium probabiltiy of visible aurora."
          break;
        case(aurora_percentage <= 100):
          aurora_string = "High probability of visible aurora."
          break;
      }
      scope.setState({aurora_activity : aurora_string});
      scope.setState({aurora_opacity : aurora_percentage * 0.5}); //Scale opacity 
    }
    reader.readAsText(blob);
    var filesize = blob.size;
  });
  } catch(err){
    scope.setState({aurora_activity : "Error fetching aurora data."});
    console.log("Error fetching aurora data from NOAA.");
  } 
};

//Take Dark Sky cloud coverage value, translate for easier readability
//TODO - style changes based on cloud coverage
parseCloudCover = async() => {
  if(this.state.data.currently.cloudCover <= 0.25){
    this.setState({cloud_coverage : "Little to no cloud coverage."})
  }else if(this.state.data.currently.cloudCover <= .50){
    this.setState({cloud_coverage : "Some cloud coverage."})
  }else if(this.state.data.currently.cloudCover <= 0.75){
    this.setState({cloud_coverage : "High cloud coverage."})
  }else{
    this.setState({cloud_coverage : "Very high cloud coverage."})
  }
};

//Kick off the location data collection + weather data, aurora data analysis 
componentDidMount(){
    this.getCoordinatesAndWeather();
} 

    render () {
        return (
        <div className = "App">
          {
          this.state.loading ?
          <Header 
              header =  "Welcome to AuroraCast" 
              subheader_1 = "Please enable your location to retrieve data." 
              />
            : [
            <Header 
              header =  {this.state.aurora_activity} 
              subheader_1 = {this.state.cloud_coverage}
              key = "header" 
              />,
              <div className = "aurora_container" key = "aurora_container">
                <div className = "aurora_background" key= "aurora_background" style = {{ opacity: `${ this.state.aurora_opacity }%` }}/>
              </div>
            ]
          }
          <Footer />
        </div>
        );
    }
}


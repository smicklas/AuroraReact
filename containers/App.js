import React, {Component} from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import './App.less';

var apiKey = "2fbcacf48f941877cd34dd5bef830b92"; //insert Darkspy API here TODO - add secrets file 
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
          aurora_activity : null,
          cloud_coverage: null
        };
        this.parseAurora = this.parseAurora.bind(this);
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
  var aurora = "";
  try{
  fetch('https://services.swpc.noaa.gov/text/aurora-nowcast-map.txt')
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
      x = x / 0.3284615; //Have to scale longitude value to match scale of map from NOAA
      var y = (latitude + 90) / 0.3515625; //Scale latitude value 
      var final_pos = Math.round((y * 1024) + x);
      var aurora_percentage = final_map[final_pos];
      switch(true){
        case (aurora_percentage < 25):
          aurora = "Little to no probability of visible aurora.";
          break;
        case (aurora_percentage < 50):
          aurora = "Low probability of visible aurora."
          break;
        case(aurora_percentage < 75):
          aurora = "Medium probabiltiy of visible aurora."
          break;
        case(aurora_percentage <= 100):
          aurora = "High probability of visible aurora."
          break;
      }
      scope.setState({aurora_activity : aurora});
    }
    reader.readAsText(blob);
    var filesize = blob.size;
  });
  } catch(err){
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
    this.setState({cloud_coverage : "High cloud coverage"})
  }else{
    this.setState({cloud_coverage : "Very high cloud coverage."})
  }
};

//Get coordinates after mounting
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
              key = "2" 
              />,
              <div className = "aurora_container" key = "3">
                <div className = "aurora_background" key= "1" />
              </div>
            ]
          }
          <Footer />
        </div>
        );
    }
}


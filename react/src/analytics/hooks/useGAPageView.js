import {useEffect} from 'react';
import ReactGa from 'react-ga';

require('dotenv').config()


export default function useGAPageView({route}) {
    //  Google Analytics implementation
    useEffect(() => {
        if(!!process.env.REACT_APP_GA_TRACKING_ID){
            ReactGa.initialize(process.env.REACT_APP_GA_TRACKING_ID)
            ReactGa.pageview(route)
        }
  }, [])
}
import React from 'react';
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';


export default ({id,count,url,MIN,MAX}) => {

    
    const BorderLinearProgress = withStyles({
        root: {
        height: 10,
        backgroundColor: lighten('#ffffff', 0.5),
        },
        bar: {
        borderRadius: 0,
        backgroundColor: '#fffff',
        },
    })(LinearProgress);

    const normalise = value => (value - MIN) * 100 / (MAX - MIN);
    console.log(id,count,url,MIN,MAX);
    return (
        <div className="d-flex justify-content-between align-items-center flex-row">
            <div style={{width:"5%"}}>
                <img src={url} className="img-fluid" />
            </div>
            <div className="w-100">
                <BorderLinearProgress variant="determinate" color="secondary" value={normalise(count)} />
            </div>
            <div>
                <p>{count} Items</p>
            </div>
        </div>
        
    )


}
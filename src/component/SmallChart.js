import React from 'react';
import {Line} from 'react-chartjs-2';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
/*
      arraySaveThis.cost.push(Math.abs(resultTransactions[z].product_cost));
			arraySaveThis.profit.push(resultTransactions[z].profit);
			arraySaveThis.revenue.push(resultTransactions[z].itemPriceCredit);
			arraySaveThis.paymentFee.push(Math.abs(resultTransactions[z].paymentFee));
			arraySaveThis.shippingFeePaidByCustomer.push(resultTransactions[z].shippingFeePaidByCustomer);
			arraySaveThis.shippingFeeChargedByLAZ.push(Math.abs(resultTransactions[z].shippingFeeChargedByLAZ));
			arraySaveThis.promotionalFlexi.push(Math.abs(resultTransactions[z].promotionalFlexi));
			arraySaveThis.promotionalVoucher.push(Math.abs(resultTransactions[z].promotionalVoucher));

			arraySaveThis.createdAt.push(resultTransactions[z].items[0].order_info[0].created_at);
			arraySaveThis.orderNo.push(resultTransactions[z].items[0].order_no)
		}

*/

export default ({title,point,label,orderNo}) => {
    const sum = point.reduce((a, b) => a + b, 0);
    const getRandomColor = () => {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    const data = {
      
      labels: label,
      datasets: [{
        label: title,
        data: point,
        borderColor: getRandomColor(),
        fill: false
      }]
    };
  
    const options = {
      responsive : true,
      title:{
        display:false,
      },
      tooltips: {
         mode: 'index',
         intersect: false,
         callbacks: {
          title: function(tooltipItem, data) {
            return "Order : " + orderNo[tooltipItem[0].index];
          },
          footer: function(tooltipItem, data) {
            return label[tooltipItem[0].index];
          }
        }
      },
      hover: {
         mode: 'index',
         intersect: false
      },
      bezierCurve : false,
      elements: {
          line: {
              tension: 0
          }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          display: false,
          ticks: {
            beginAtZero: true
          }
        }],              
      },

   }



   return (
        <div className="box-shadow p-2 text-left">
          <div className="mx-3">
            <h4>฿ {sum}</h4>
            <h6 className="text-secondary">{title}</h6>
          </div>
          <Divider variant="middle"/>
          <div className="p-3 mt-3">
            <Line data={data} options={options} />
          </div>
        </div>
    );

    
}
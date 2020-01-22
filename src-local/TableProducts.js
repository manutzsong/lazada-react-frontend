import React from 'react';
import MaterialTable from 'material-table';


export default ({orderData}) => {


    return (
        <MaterialTable
        title="Order List"
        columns={[
            { title: 'Order Id', field: 'orderId' },
            { title: 'Name', field: 'inventoryName' },
            { title: 'Price', field: 'inventoryPrice', type: 'numeric' },
            { title: 'Cost', field: 'inventoryCost', type: 'numeric' },
            { title: 'Profit', field: 'profit', type: 'numeric' },
            { title: 'Profit Ratio', field: 'profitToRevenue', type: 'numeric' },
        ]}
        data={orderData}    
        options={{
            sorting: true
        }}
        />
    )


}
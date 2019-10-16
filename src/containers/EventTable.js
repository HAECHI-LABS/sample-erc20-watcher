import React from 'react';
import styled from 'styled-components';
import Table from '../components/common/Table';
import Responsive from '../components/common/Responsive';
import Typography from '@material-ui/core/Typography';
import load from '../lib/api/events';


const EventTableStype = styled(Responsive)`
  display: flex;
  flex:2;
`;

// IntegrationList.propTypes = {};

export default class IntegrationList extends React.Component {
  constructor(){
        super()
        this.state = {events:[]}
    }
  componentDidMount() {
      setInterval(this.polling, 1000);
  }
  polling = async () => {
    this.setState({events: (await load()).data.reverse()})
  }

  render() {
        return (
        <EventTableStype>
        <Table
            columns={[
            {header: 'Event', accessor: 'event'},
            {header: 'Parameters', accessor: 'parameters'},
            {header: 'BlockNumber', accessor: 'blocknumber'},

            ]}
            data={ {
             events: this.state.events
            } }
            page={0}
            lastPage={this.state.length-1}
            rowsPerPage={10}
            onChangePage={(page) => {}}
        />
        </EventTableStype>
    );
    }
}


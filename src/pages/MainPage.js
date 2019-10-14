import React from 'react';
import { Main } from './layouts';
import EventTable from '../containers/EventTable';
import MetaInfoPaper from '../containers/MetaInfoPaper';
import LoadingBar from '../components/LoadingBar';

function MainPage() {
  return (
    <Main>
        <MetaInfoPaper />
        <LoadingBar />
        <EventTable />
    </Main>
  );
}

export default MainPage;

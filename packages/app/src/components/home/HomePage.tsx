import React from 'react';
import {
    HomePageRandomJoke,
    HomePageStarredEntities,
    CustomHomepageGrid,
    HomePageCompanyLogo,
  } from '@backstage/plugin-home';
  import { HomePageSearchBar } from '@backstage/plugin-search';
  import { MicrosoftCalendarCard } from '@backstage/plugin-microsoft-calendar';
  import MyCustomLogoFull from '/Users/wojckechprzybylski/my-backstage-app/packages/app/src/HomePageCompanyLogo.svg';


const HomeLogo = () => {
    return <img src={MyCustomLogoFull}/>;
  };

export const homePage = (
    <CustomHomepageGrid >
    <HomePageCompanyLogo logo={ <HomeLogo /> }/>
    <MyCustomLogoFull/>
    // Insert the allowed widgets inside the grid
    <HomePageSearchBar />
    <HomePageRandomJoke />
    <MicrosoftCalendarCard />
    <HomePageStarredEntities />
</CustomHomepageGrid>
);
#!/usr/bin/python
# -*- coding: utf-8 -*-
# import the Auth Helper class
import hello_analytics_api_v3_auth

from apiclient.errors import HttpError
from oauth2client.client import AccessTokenRefreshError

def insertExperiment(accountID, webPropertyId, profileId, experiment_body):
  # Step 1. Get an analytics service object.
  service = hello_analytics_api_v3_auth.initialize_service()

  try:
    # for the test:

    experiment = service.management().experiments().insert(
      accountID = accountID,
      webPropertyId = webPropertyId,
      profileId = profileId,
      body = experiment_body).execute()
    insertExperiment("46140385", "UA-46140385-1", "79670733", experiment_bodz)


    # # Step 2. Get the user's first ]profile ID.
    # profile_id = get_first_profile_id(service)
    # if profile_id:
    #   # Step 3. Query the Core Reporting API.
    #   results = get_results(service, profile_id)
    #   # Step 4. Output the results.
    #   print_results(results)

  except TypeError, error:
    # Handle errors in constructing a query.
    print ('There was an error in constructing your query : %s' % error)

  except HttpError, error:
    # Handle API errors.
    print ('Arg, there was an API error : %s : %s' %
           (error.resp.status, error._get_reason()))

  except AccessTokenRefreshError:
    # Handle Auth errors.
    print ('The credentials have been revoked or expired, please re-run '
           'the application to re-authorize')
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const key: string = '68991fbb0b75dba5ae0ecd8182e967b1'
const mcuKeywordID: number = 180547
const documentaryID: number = 99
const shortID: number = 214549
const tvMovieID: number = 10770

@Injectable({
  providedIn: 'root'
})
export class MovieDBWebService {

  constructor(private http: HttpClient) {}

  getKeywordID() {
    return this.http.get(`https://api.themoviedb.org/3/search/keyword?api_key=${key}&query=marvel%20cinematic%20universe&page=1`)
  }

  getByKeywordID() {
    return this.http.get(`https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_keywords=${mcuKeywordID}&without_genres=${documentaryID},${tvMovieID}&without_keywords=${shortID}`)
  }

  getByKeywordIDChrono() {
    return this.http.get(`https://api.themoviedb.org/3/discover/movie?api_key=${key}&sort_by=primary_release_date.asc&with_keywords=${mcuKeywordID}&without_genres=${documentaryID},${tvMovieID}&without_keywords=${shortID}&with_runtime.gte=60`)
  }
  getByKeywordIDChronoNextPage(page) {
    return this.http.get(`https://api.themoviedb.org/3/discover/movie?api_key=${key}&sort_by=primary_release_date.asc&page=${page}&with_keywords=${mcuKeywordID}&without_genres=${documentaryID},${tvMovieID}&without_keywords=${shortID}&with_runtime.gte=60`)
  }

  getMovieByID(id) {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${key}`)
  }

  getCreditsByID(id) {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${key}`)
  }
  
}

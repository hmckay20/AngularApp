import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductInfo } from './models/product-info.model';

@Injectable({
  providedIn: 'root'})
export class ProductService {
  private baseUrl = 'http://localhost:5161/Products/search'; // Ensure URL is correct

  constructor(private http: HttpClient) { }

  searchProducts(queries: string[], page: string = '1', country: string = 'US', categoryId: string = 'aps'): Observable<ProductInfo[]> {
    return this.http.post<ProductInfo[]>(this.baseUrl, {
      queries,
      page,
      country,
      categoryId
    });
  }
}
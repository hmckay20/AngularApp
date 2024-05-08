import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { HttpClientModule } from '@angular/common/http';
import { ProductInfo } from './models/product-info.model';
import { jsPDF } from 'jspdf';
import  html2canvas  from 'html2canvas'




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [ProductService]
})
export class AppComponent {
  title = 'Kowalske Bath and Kitchen Search';
  inputs: any[] = [{ guessedBrand: '', serialNumber: '', searched: false }];
  productsData: ProductInfo[] | null = null;
  loading = false;

  constructor(private productService: ProductService) { }

  addInput() {
    this.inputs.push({ guessedBrand: '', serialNumber: '', searched: false });
  }

  search() {
    this.loading = true;
    const unsearchedQueries = this.inputs
      .filter(input => !input.searched) // Filter for inputs that haven't been searched
      .map(input => `${input.guessedBrand} ${input.serialNumber}`.trim());
  
    if (unsearchedQueries.length === 0) {
      this.loading = false;
      console.log('No new or modified inputs to search.');
      return; // Exit if no queries to process
    }
  
    this.productService.searchProducts(unsearchedQueries).subscribe({
      next: (data) => {
        // Assuming data returned matches the order and count of unsearchedQueries
        const newData = data.map((product, index) => ({
          ...product,
          query: unsearchedQueries[index] // Map the query to the product
        }));
        
        // Merge new data with existing productsData
        this.productsData = [...(this.productsData || []), ...newData];
        
        // Mark all inputs as searched
        this.inputs.forEach(input => {
          input.searched = true;
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching data: ', error);
        this.loading = false;
      }
    });
  }
  
  
  
  exportPDF() {
    const data = document.getElementById('results-table'); // Ensure your results table has this ID
    if (data) {
      html2canvas(data, {
        scale: 1, // You can adjust this value to get better quality or fit
        useCORS: true // This is important to ensure images loaded from other domains are rendered
      }).then(canvas => {
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
  
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
  
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
  
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('results.pdf');
      });
    } else {
      console.error('Unable to find the element');
    }
  }
  

  removeInput(index: number) {
    this.inputs.splice(index, 1);
  }
  markAsUnsearched(index: number) {
    this.inputs[index].searched = false;
  }

}

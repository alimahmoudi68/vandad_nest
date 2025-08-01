import { PaginationDto } from "src/common/dto/pagination.dto";

export function paginationSolver(paginationDto: PaginationDto){
    let {page = 1, limit=10} = paginationDto;
    if(!page || page <1){
        page = 1;
    }
    if(!limit || limit <= 0){
        limit = 10;
    }
    let skip = (page-1)*limit;

    return {
        page,
        limit,
        skip
    }

}   